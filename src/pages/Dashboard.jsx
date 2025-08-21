import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function normalizeName(name) {
	return (name || '').toString().replace(/\s+/g, ' ').trim().toLowerCase();
}

export default function Dashboard() {
	const navigate = useNavigate();
	const [adminId, setAdminId] = useState('');
	const [copied, setCopied] = useState(false);
	const [candidateQuery, setCandidateQuery] = useState('');
	const [candidateLookupId, setCandidateLookupId] = useState('');
	const [candidateProfile, setCandidateProfile] = useState(null);
	const [notFound, setNotFound] = useState(false);
	const [otpTxnId, setOtpTxnId] = useState('');
	const [otp, setOtp] = useState('');
	const [otpStatus, setOtpStatus] = useState('');
	const [aadhaarVerified, setAadhaarVerified] = useState(false);

	useEffect(() => {
		setAdminId(localStorage.getItem('adminId') || '');
	}, []);

	function handleLogout() {
		localStorage.removeItem('isAdmin');
		navigate('/admin/login');
	}

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(adminId);
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch {}
	}

	function handleCandidateLookup(e) {
		e.preventDefault();
		setNotFound(false);
		setCandidateLookupId('');
		setCandidateProfile(null);
		setOtpTxnId('');
		setOtp('');
		setOtpStatus('');
		setAadhaarVerified(false);
		try {
			const directoryRaw = localStorage.getItem('candidateDirectory');
			const directory = directoryRaw ? JSON.parse(directoryRaw) : {};
			const key = normalizeName(candidateQuery);
			let id = directory[key];
			let profileObj = null;

			// Fallback: if not found, check saved candidate profile directly
			if (!id) {
				const profileRaw = localStorage.getItem('candidateProfile');
				const savedId = localStorage.getItem('candidateId');
				if (profileRaw && savedId) {
					try {
						const profile = JSON.parse(profileRaw);
						if (normalizeName(profile.fullName) === key) {
							id = savedId;
							profileObj = profile;
							// Heal the directory for next time
							directory[key] = id;
							localStorage.setItem('candidateDirectory', JSON.stringify(directory));
						}
					} catch {}
				}
			} else {
				// We have an ID from directory; try load profile for display
				const profileRaw = localStorage.getItem('candidateProfile');
				if (profileRaw) {
					try {
						const profile = JSON.parse(profileRaw);
						if (normalizeName(profile.fullName) === key) {
							profileObj = profile;
						}
					} catch {}
				}
			}

			if (id) {
				setCandidateLookupId(id);
				if (profileObj) setCandidateProfile(profileObj);
				// Load existing verification status for this candidate
				try {
					const verifRaw = localStorage.getItem('candidateVerification');
					if (verifRaw) {
						const verif = JSON.parse(verifRaw);
						const rec = verif[id];
						setAadhaarVerified(Boolean(rec && rec.verified));
					}
				} catch {}
			} else {
				setNotFound(true);
			}
		} catch {
			setNotFound(true);
		}
	}

	async function initiateOtpForCandidate() {
		if (!candidateProfile?.aadhar) {
			setOtpStatus('Candidate Aadhaar missing');
			return;
		}
		setOtp('');
		setOtpStatus('');
		try {
			const resp = await fetch('/api/uidai/otp/initiate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ aadhaar: String(candidateProfile.aadhar).replace(/\s+/g, '') })
			});
			const data = await resp.json();
			if (data.ok && data.txnId) {
				setOtpTxnId(data.txnId);
				if (data.mock && data.testOtp) {
					setOtpStatus(`Test OTP (mock): ${data.testOtp}`);
				} else {
					setOtpStatus('OTP sent to candidate\'s Aadhaar-linked mobile');
				}
			} else {
				setOtpStatus(data.error || 'Failed to send OTP');
			}
		} catch {
			setOtpStatus('Network error');
		}
	}

	async function verifyCandidateOtp() {
		if (!otpTxnId || !otp) {
			setOtpStatus('Enter OTP first');
			return;
		}
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
				setAadhaarVerified(true);
				// Persist verification record keyed by candidate ID
				try {
					const verifRaw = localStorage.getItem('candidateVerification');
					const verif = verifRaw ? JSON.parse(verifRaw) : {};
					verif[candidateLookupId] = {
						verified: true,
						at: new Date().toISOString()
					};
					localStorage.setItem('candidateVerification', JSON.stringify(verif));
				} catch {}
			} else {
				setOtpStatus(data.error || 'OTP verification failed');
			}
		} catch {
			setOtpStatus('Network error');
		}
	}

	return (
		<div className="dashboard-page">
			<div className="glass-card dashboard-card">
				<h1 className="title">Welcome, Admin! 🎉</h1>
				<p className="subtitle">You're seeing a protected area because you logged in.</p>

				{adminId && (
					<div className="id-banner">
						<span className="id-label">Your Admin ID:</span>
						<code className="id-value">{adminId}</code>
						<button className="btn id-copy" type="button" onClick={handleCopy}>
							{copied ? 'Copied!' : 'Copy'}
						</button>
					</div>
				)}

				<div className="dashboard-grid">
					<div className="stat-card">
						<div className="stat-value">24</div>
						<div className="stat-label">New messages</div>
					</div>
					<div className="stat-card">
						<div className="stat-value">5</div>
						<div className="stat-label">Pending tasks</div>
					</div>
					<div className="stat-card">
						<div className="stat-value">98%</div>
						<div className="stat-label">Uptime</div>
					</div>
				</div>

				<h2 className="title" style={{ marginTop: 6 }}>Find a Candidate</h2>
				<p className="subtitle">Enter the candidate's full name to see their details and unique Candidate ID.</p>
				<form className="form" onSubmit={handleCandidateLookup}>
					<div className="form-grid">
						<div className="form-group" style={{ gridColumn: '1 / -1' }}>
							<label>Candidate name</label>
							<input
								className="input"
								value={candidateQuery}
								onChange={(e) => setCandidateQuery(e.target.value)}
								placeholder="e.g., John   Doe"
							/>
						</div>
					</div>
					<div style={{ display: 'flex', gap: 12 }}>
						<button className="btn primary" type="submit">Search</button>
					</div>
				</form>

				{candidateLookupId && (
					<div className="id-banner" style={{ marginTop: 10 }}>
						<span className="id-label">Candidate ID:</span>
						<code className="id-value">{candidateLookupId}</code>
					</div>
				)}

				{candidateProfile && (
					<>
						<div className="summary-grid">
							<div className="summary-item"><span>Name</span><strong>{candidateProfile.fullName}</strong></div>
							<div className="summary-item"><span>Age</span><strong>{candidateProfile.age}</strong></div>
							<div className="summary-item"><span>DOB</span><strong>{candidateProfile.dob}</strong></div>
							<div className="summary-item"><span>Gender</span><strong>{candidateProfile.gender}</strong></div>
							<div className="summary-item"><span>Email</span><strong>{candidateProfile.email}</strong></div>
							<div className="summary-item"><span>Aadhaar</span><strong>{candidateProfile.aadhar}</strong></div>
							<div className="summary-item"><span>PAN</span><strong>{candidateProfile.pan}</strong></div>
						</div>

						<div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
							<span className="subtitle" style={{ margin: 0 }}>Aadhaar status:</span>
							<div className="note success" style={{ background: aadhaarVerified ? '#ECFDF5' : '#F3F4F6', color: aadhaarVerified ? '#065F46' : '#374151', borderColor: aadhaarVerified ? '#A7F3D0' : '#E5E7EB' }}>
								{aadhaarVerified ? 'Verified' : 'Not Verified'}
							</div>
						</div>

						<div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
							<button className="btn primary" type="button" onClick={initiateOtpForCandidate}>Send OTP to Candidate</button>
							{otpTxnId && (
								<>
									<input className="input" style={{ width: 160 }} placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
									<button className="btn primary" type="button" onClick={verifyCandidateOtp}>Verify OTP</button>
								</>
							)}
							{otpStatus && (
								<div className="note success" style={{ background: '#EFF6FF', color: '#1E40AF', borderColor: '#BFDBFE' }}>{otpStatus}</div>
							)}
						</div>
					</>
				)}

				{notFound && <div className="note success" style={{ background: '#FEF2F2', color: '#B91C1C', borderColor: '#FECACA' }}>No candidate found by that name.</div>}

				<button className="btn danger" onClick={handleLogout} style={{ marginTop: 12 }}>
					Log Out
				</button>
			</div>
		</div>
	);
}