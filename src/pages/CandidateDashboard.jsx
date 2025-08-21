import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function CandidateDashboard() {
	const navigate = useNavigate();

	const [profile, setProfile] = useState({
		fullName: '',
		age: '',
		dob: '',
		gender: '',
		email: '',
		aadhar: '',
		pan: ''
	});
	const [errors, setErrors] = useState({});
	const [savedMessage, setSavedMessage] = useState('');
	const [candidateId, setCandidateId] = useState('');
	const [copied, setCopied] = useState(false);
	const [isProfileSaved, setIsProfileSaved] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const [verification, setVerification] = useState(null);
	const [otpTxnId, setOtpTxnId] = useState('');
	const [otp, setOtp] = useState('');
	const [otpStatus, setOtpStatus] = useState('');

	useEffect(() => {
		const saved = localStorage.getItem('candidateProfile');
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				setProfile((prev) => ({ ...prev, ...parsed }));
				setIsProfileSaved(Object.keys(validateProfile(parsed)).length === 0);

				const cidLocal = localStorage.getItem('candidateId');
				const keyLocal = (parsed.fullName || '').trim().toLowerCase();
				if (cidLocal && keyLocal) {
					const directoryRaw = localStorage.getItem('candidateDirectory');
					const directory = directoryRaw ? JSON.parse(directoryRaw) : {};
					if (!directory[keyLocal]) {
						directory[keyLocal] = cidLocal;
						localStorage.setItem('candidateDirectory', JSON.stringify(directory));
					}
				}
			} catch {}
		}
		const cid = localStorage.getItem('candidateId') || '';
		setCandidateId(cid);
	}, []);

	function handleLogout() {
		localStorage.removeItem('isCandidate');
		navigate('/candidate/login');
	}

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(candidateId);
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch {}
	}

	function validateProfile(values) {
		const nextErrors = {};

		if (!values.fullName || values.fullName.trim().length < 2) {
			nextErrors.fullName = 'Please enter your full name.';
		}

		const ageNum = Number(values.age);
		if (!values.age || Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
			nextErrors.age = 'Enter a valid age (1-120).';
		}

		if (!values.dob) {
			nextErrors.dob = 'Date of birth is required.';
		}

		if (!values.gender) {
			nextErrors.gender = 'Please select your gender.';
		}

		const emailRegex = /.+@.+\..+/;
		if (!values.email || !emailRegex.test(values.email)) {
			nextErrors.email = 'Enter a valid email address.';
		}

		const aadharRegex = /^\d{12}$/;
		if (!values.aadhar || !aadharRegex.test(values.aadhar)) {
			nextErrors.aadhar = 'Aadhaar must be a 12-digit number.';
		}

		const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/i;
		if (!values.pan || !panRegex.test(values.pan)) {
			nextErrors.pan = 'PAN must be 10 characters (e.g., ABCDE1234F).';
		}

		return nextErrors;
	}

	function persistProfileAndDirectory(profileToSave) {
		localStorage.setItem('candidateProfile', JSON.stringify(profileToSave));
		try {
			const cid = localStorage.getItem('candidateId');
			const key = (profileToSave.fullName || '').trim().toLowerCase();
			if (cid && key) {
				const directoryRaw = localStorage.getItem('candidateDirectory');
				const directory = directoryRaw ? JSON.parse(directoryRaw) : {};
				directory[key] = cid;
				localStorage.setItem('candidateDirectory', JSON.stringify(directory));
			}
		} catch {}
	}

	function handleChange(e) {
		const { name, value } = e.target;
		const nextValue = name === 'pan' ? value.toUpperCase() : value;
		const updated = { ...profile, [name]: nextValue };
		setProfile(updated);
		if (savedMessage) setSavedMessage('');

		const nextErrors = validateProfile(updated);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length === 0) {
			persistProfileAndDirectory(updated);
			setSavedMessage('Profile saved successfully.');
			setIsProfileSaved(true);
		}
	}

	async function verifyAadhaar() {
		setVerifying(true);
		setVerification(null);
		try {
			const resp = await fetch('/api/verify-aadhaar', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					aadhaar: profile.aadhar,
					candidateId,
					name: profile.fullName,
					dob: profile.dob
				})
			});
			const data = await resp.json();
			setVerification(data);
		} catch (e) {
			setVerification({ ok: false, error: 'Network error' });
		} finally {
			setVerifying(false);
		}
	}

	async function initiateOtp() {
		setOtp('');
		setOtpStatus('');
		try {
			const resp = await fetch('/api/uidai/otp/initiate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ aadhaar: profile.aadhar })
			});
			const data = await resp.json();
			if (data.ok && data.txnId) {
				setOtpTxnId(data.txnId);
				if (data.mock && data.testOtp) {
					setOtpStatus(`Test OTP (mock): ${data.testOtp}`);
				} else {
					setOtpStatus('OTP sent to Aadhaar-linked mobile');
				}
			} else {
				setOtpStatus(data.error || 'Failed to send OTP');
			}
		} catch {
			setOtpStatus('Network error');
		}
	}

	async function verifyOtp() {
		setOtpStatus('');
		try {
			const resp = await fetch('/api/uidai/otp/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ txnId: otpTxnId, otp })
			});
			const data = await resp.json();
			if (data.ok && data.verified) {
				setOtpStatus('Aadhaar verified via provider');
			} else {
				setOtpStatus(data.error || 'OTP verification failed');
			}
		} catch {
			setOtpStatus('Network error');
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
	}

	return (
		<div className="dashboard-page">
			<div className="glass-card dashboard-card">
				<h1 className="title">Welcome, Candidate! 🌟</h1>
				<p className="subtitle">Here is your candidate area.</p>

				{candidateId && (
					<div className="id-banner">
						<span className="id-label">Your Candidate ID:</span>
						<code className="id-value">{candidateId}</code>
						<button className="btn id-copy" type="button" onClick={handleCopy}>
							{copied ? 'Copied!' : 'Copy'}
						</button>
					</div>
				)}

				<div className="dashboard-grid">
					<div className="stat-card">
						<div className="stat-value">3</div>
						<div className="stat-label">Scheduled interviews</div>
					</div>
					<div className="stat-card">
						<div className="stat-value">12</div>
						<div className="stat-label">Applied jobs</div>
					</div>
					<div className="stat-card">
						<div className="stat-value">2</div>
						<div className="stat-label">Offers</div>
					</div>
				</div>

				<h2 className="title" style={{ marginTop: 6 }}>Your Profile</h2>
				<p className="subtitle">We auto-save once all fields are valid.</p>

				{isProfileSaved ? (
					<div className="summary-grid">
						<div className="summary-item"><span>Name</span><strong>{profile.fullName}</strong></div>
						<div className="summary-item"><span>Age</span><strong>{profile.age}</strong></div>
						<div className="summary-item"><span>DOB</span><strong>{profile.dob}</strong></div>
						<div className="summary-item"><span>Gender</span><strong>{profile.gender}</strong></div>
						<div className="summary-item"><span>Email</span><strong>{profile.email}</strong></div>
						<div className="summary-item"><span>Aadhaar</span><strong>{profile.aadhar}</strong></div>
						<div className="summary-item"><span>PAN</span><strong>{profile.pan}</strong></div>
						<div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
							<button className="btn primary" type="button" onClick={initiateOtp}>Send OTP (UIDAI Provider)</button>
							{otpTxnId && (
								<>
									<input className="input" style={{ width: 160 }} placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
									<button className="btn primary" type="button" onClick={verifyOtp}>Verify OTP</button>
								</>
							)}
							{otpStatus && (
								<div className="note success" style={{ background: '#EFF6FF', color: '#1E40AF', borderColor: '#BFDBFE' }}>{otpStatus}</div>
							)}
						</div>
					</div>
				) : (
					<form className="form" onSubmit={handleSubmit} noValidate>
						<div className="form-grid">
							<div className="form-group">
								<label>Full name</label>
								<input
									className="input"
									name="fullName"
									value={profile.fullName}
									onChange={handleChange}
									placeholder="John Doe"
								/>
								{errors.fullName && <div className="field-error">{errors.fullName}</div>}
							</div>

							<div className="form-group">
								<label>Age</label>
								<input
									className="input"
									type="number"
									name="age"
									value={profile.age}
									onChange={handleChange}
									placeholder="24"
									min={1}
									max={120}
								/>
								{errors.age && <div className="field-error">{errors.age}</div>}
							</div>

							<div className="form-group">
								<label>Date of birth</label>
								<input
									className="input"
									type="date"
									name="dob"
									value={profile.dob}
									onChange={handleChange}
								/>
								{errors.dob && <div className="field-error">{errors.dob}</div>}
							</div>

							<div className="form-group">
								<label>Gender</label>
								<select
									className="input"
									name="gender"
									value={profile.gender}
									onChange={handleChange}
								>
									<option value="">Select</option>
									<option value="Male">Male</option>
									<option value="Female">Female</option>
									<option value="Other">Other</option>
									<option value="Prefer not to say">Prefer not to say</option>
								</select>
								{errors.gender && <div className="field-error">{errors.gender}</div>}
							</div>

							<div className="form-group">
								<label>Email</label>
								<input
									className="input"
									type="email"
									name="email"
									value={profile.email}
									onChange={handleChange}
									placeholder="you@example.com"
								/>
								{errors.email && <div className="field-error">{errors.email}</div>}
							</div>

							<div className="form-group">
								<label>Aadhaar number</label>
								<input
									className="input"
									name="aadhar"
									value={profile.aadhar}
									onChange={handleChange}
									placeholder="12-digit number"
									inputMode="numeric"
									pattern="\d{12}"
								/>
								{errors.aadhar && <div className="field-error">{errors.aadhar}</div>}
							</div>

							<div className="form-group">
								<label>PAN number</label>
								<input
									className="input"
									name="pan"
									value={profile.pan}
									onChange={handleChange}
									placeholder="ABCDE1234F"
								/>
								{errors.pan && <div className="field-error">{errors.pan}</div>}
							</div>
						</div>

						{savedMessage && <div className="note success">{savedMessage}</div>}
					</form>
				)}
			</div>
		</div>
	);
} 