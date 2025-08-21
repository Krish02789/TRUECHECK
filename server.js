import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import connectDB from './config/database.js';
import userRoutes from './routes/users.js';
import { checkDatabaseHealth } from './utils/dbUtils.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// In-memory store for mock OTPs (dev only)
const mockOtps = new Map(); // txnId -> { otp, expiresAt, aadhaar }
const emailOtps = new Map(); // txnId -> { otp, expiresAt, email }

// Verhoeff algorithm tables
const d = [
	[0,1,2,3,4,5,6,7,8,9],
	[1,2,3,4,0,6,7,8,9,5],
	[2,3,4,0,1,7,8,9,5,6],
	[3,4,0,1,2,8,9,5,6,7],
	[4,0,1,2,3,9,5,6,7,8],
	[5,9,8,7,6,0,4,3,2,1],
	[6,5,9,8,7,1,0,4,3,2],
	[7,6,5,9,8,2,1,0,4,3],
	[8,7,6,5,9,3,2,1,0,4],
	[9,8,7,6,5,4,3,2,1,0]
];
const p = [
	[0,1,2,3,4,5,6,7,8,9],
	[1,5,7,6,2,8,3,0,9,4],
	[5,8,0,3,7,9,6,1,4,2],
	[8,9,1,6,0,4,3,5,2,7],
	[9,4,5,3,1,2,6,8,7,0],
	[4,2,8,6,5,7,3,9,0,1],
	[2,7,9,3,8,0,6,4,1,5],
	[7,0,4,6,9,1,3,2,5,8]
];

function verhoeffCheck(num) {
	if (!/^\d+$/.test(num)) return false;
	let c = 0;
	const arr = num.split('').reverse().map((n) => parseInt(n, 10));
	for (let i = 0; i < arr.length; i++) {
		c = d[c][p[i % 8][arr[i]]];
	}
	return c === 0;
}

function generateOtp() {
	return String(Math.floor(100000 + Math.random() * 900000));
}

function createMailTransport() {
	if (!process.env.EMAIL_HOST) return null;
	return nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: Number(process.env.EMAIL_PORT || 587),
		secure: Boolean(process.env.EMAIL_SECURE === 'true'),
		auth: process.env.EMAIL_USER && process.env.EMAIL_PASS ? {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS
		} : undefined
	});
}

app.post('/api/verify-aadhaar', (req, res) => {
	const { aadhaar, candidateId, name, dob } = req.body || {};
	const clean = (aadhaar || '').replace(/\s+/g, '');
	const isFormatValid = /^\d{12}$/.test(clean);
	const isChecksumValid = isFormatValid && verhoeffCheck(clean);

	// This is a MOCK verification. Real UIDAI verification requires licensed KUA/ASA.
	const verified = Boolean(isChecksumValid);
	const result = {
		ok: true,
		verified,
		source: 'mock-verhoeff',
		candidateId: candidateId || null,
		aadhaarLast4: isFormatValid ? clean.slice(-4) : null,
		name: name || null,
		dob: dob || null,
		verifiedAt: new Date().toISOString()
	};
	return res.json(result);
});

// UIDAI OTP (with fallback to mock)
app.post('/api/uidai/otp/initiate', async (req, res) => {
	const { aadhaar } = req.body || {};
	if (!aadhaar || !/^\d{12}$/.test(String(aadhaar))) {
		return res.status(400).json({ ok: false, error: 'Invalid Aadhaar' });
	}
	if (!process.env.PROVIDER_BASE_URL) {
		// Mock mode
		const txnId = `TXN-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
		const otp = generateOtp();
		mockOtps.set(txnId, { otp, aadhaar: String(aadhaar), expiresAt: Date.now() + 5 * 60 * 1000 });
		console.log(`[MOCK OTP] Aadhaar ${aadhaar} -> txnId ${txnId}, OTP ${otp}`);
		return res.json({ ok: true, txnId, mock: true, testOtp: otp });
	}
	try {
		const resp = await axios.post(`${process.env.PROVIDER_BASE_URL}/otp/initiate`,
			{ aadhaar },
			{ headers: { 'x-api-key': process.env.PROVIDER_API_KEY, 'x-client-id': process.env.PROVIDER_CLIENT_ID } }
		);
		return res.json({ ok: true, txnId: resp.data.txnId || null });
	} catch (e) {
		console.error('[PROVIDER ERROR][initiate]', e?.response?.status, e?.response?.data || e?.message);
		// Fallback to mock
		const txnId = `TXN-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
		const otp = generateOtp();
		mockOtps.set(txnId, { otp, aadhaar: String(aadhaar), expiresAt: Date.now() + 5 * 60 * 1000 });
		console.log(`[MOCK OTP][FALLBACK] Aadhaar ${aadhaar} -> txnId ${txnId}, OTP ${otp}`);
		return res.json({ ok: true, txnId, mock: true, testOtp: otp, note: 'provider_failed_fallback_mock' });
	}
});

app.post('/api/uidai/otp/verify', async (req, res) => {
	const { txnId, otp } = req.body || {};
	if (!txnId || !otp) {
		return res.status(400).json({ ok: false, error: 'Missing txnId or otp' });
	}
	if (!process.env.PROVIDER_BASE_URL) {
		const rec = mockOtps.get(String(txnId));
		const verified = Boolean(rec && String(rec.otp) === String(otp) && Date.now() <= rec.expiresAt);
		if (verified) mockOtps.delete(String(txnId));
		return res.json({ ok: true, verified, data: { mock: true } });
	}
	try {
		const resp = await axios.post(`${process.env.PROVIDER_BASE_URL}/otp/verify`,
			{ txnId, otp },
			{ headers: { 'x-api-key': process.env.PROVIDER_API_KEY, 'x-client-id': process.env.PROVIDER_CLIENT_ID } }
		);
		return res.json({ ok: true, verified: Boolean(resp.data.verified), data: resp.data || null });
	} catch (e) {
		console.error('[PROVIDER ERROR][verify]', e?.response?.status, e?.response?.data || e?.message);
		const rec = mockOtps.get(String(txnId));
		if (rec) {
			const verified = Boolean(String(rec.otp) === String(otp) && Date.now() <= rec.expiresAt);
			if (verified) mockOtps.delete(String(txnId));
			return res.json({ ok: true, verified, data: { mock: true, note: 'provider_failed_fallback_mock' } });
		}
		return res.status(502).json({ ok: false, error: 'Provider error' });
	}
});

// Email OTP (SMTP backed with mock fallback)
app.post('/api/email/send-otp', async (req, res) => {
	const { email } = req.body || {};
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
		return res.status(400).json({ ok: false, error: 'Invalid email' });
	}
	const txnId = `EMAIL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
	const otp = generateOtp();
	const record = { otp, email: String(email), expiresAt: Date.now() + 10 * 60 * 1000 };
	emailOtps.set(txnId, record);

	const transport = createMailTransport();
	if (!transport) {
		console.log(`[MOCK EMAIL OTP] Email ${email} -> txnId ${txnId}, OTP ${otp}`);
		return res.json({ ok: true, txnId, mock: true, testOtp: otp });
	}
	try {
		await transport.sendMail({
			from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@example.com',
			to: email,
			subject: 'Your verification code',
			text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
			html: `<p>Your OTP code is <b>${otp}</b>. It expires in 10 minutes.</p>`
		});
		return res.json({ ok: true, txnId });
	} catch (e) {
		console.error('[EMAIL ERROR][send]', e?.response?.status, e?.response?.data || e?.message);
		console.log(`[MOCK EMAIL OTP][FALLBACK] Email ${email} -> txnId ${txnId}, OTP ${otp}`);
		return res.json({ ok: true, txnId, mock: true, testOtp: otp, note: 'email_send_failed_fallback_mock' });
	}
});

app.post('/api/email/verify', (req, res) => {
	const { txnId, otp } = req.body || {};
	if (!txnId || !otp) {
		return res.status(400).json({ ok: false, error: 'Missing txnId or otp' });
	}
	const rec = emailOtps.get(String(txnId));
	const verified = Boolean(rec && String(rec.otp) === String(otp) && Date.now() <= rec.expiresAt);
	if (verified) emailOtps.delete(String(txnId));
	return res.json({ ok: true, verified });
});

app.get('/api/health', async (_req, res) => {
  const dbHealth = await checkDatabaseHealth();
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 