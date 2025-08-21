import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function generateCandidateId() {
	const ts = Date.now().toString(36).toUpperCase();
	const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
	return `CAND-${ts}-${rnd}`;
}

export default function CandidateLogin() {
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const VALID_USERNAME = 'candidate';
	const VALID_PASSWORD = 'candidate123';

	function handleSubmit(e) {
		e.preventDefault();
		setIsLoading(true);

		setTimeout(() => {
			if (username === VALID_USERNAME && password === VALID_PASSWORD) {
				localStorage.setItem('isCandidate', 'true');
				if (!localStorage.getItem('candidateId')) {
					localStorage.setItem('candidateId', generateCandidateId());
				}
				navigate('/candidate/dashboard');
			} else {
				setErrorMessage('Wrong username or password. Try again.');
			}
			setIsLoading(false);
		}, 600);
	}

	return (
		<div className="dashboard-page">
			<div className="glass-card" style={{ maxWidth: '450px' }}>
				<div style={{ textAlign: 'center', marginBottom: '30px' }}>
					<div style={{
						display: 'inline-flex',
						height: '60px',
						width: '60px',
						alignItems: 'center',
						justifyContent: 'center',
						borderRadius: '16px',
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						color: 'white',
						fontSize: '24px',
						fontWeight: '700',
						marginBottom: '20px',
						boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
					}}>👨‍💼</div>
					<h1 className="title">Candidate Login</h1>
					<p className="subtitle">Welcome! Please sign in to access your candidate dashboard</p>
				</div>

				<form className="form" onSubmit={handleSubmit}>
					<div className="form-group">
						<label>Username</label>
						<input
							className="input"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Enter your username"
							autoComplete="username"
						/>
					</div>

					<div className="form-group">
						<label>Password</label>
						<div style={{ position: 'relative' }}>
							<input
								className="input"
								style={{ paddingRight: '50px' }}
								type={showPassword ? 'text' : 'password'}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password"
								autoComplete="current-password"
							/>
							<button
								type="button"
								style={{
									position: 'absolute',
									right: '12px',
									top: '50%',
									transform: 'translateY(-50%)',
									fontSize: '20px',
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									padding: '8px',
									borderRadius: '8px',
									transition: 'all 0.3s ease'
								}}
								onClick={() => setShowPassword((v) => !v)}
								aria-label={showPassword ? 'Hide password' : 'Show password'}
								onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)'}
								onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
							>
								{showPassword ? '🙈' : '👁️'}
							</button>
						</div>
					</div>

					{errorMessage && (
						<div className="note success" style={{ 
							background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', 
							color: '#dc2626', 
							borderColor: '#fecaca' 
						}}>
							⚠️ {errorMessage}
						</div>
					)}

					<button
						className="btn primary"
						type="submit"
						disabled={isLoading}
						style={{ 
							opacity: isLoading ? 0.7 : 1,
							width: '100%'
						}}
					>
						{isLoading && (
							<span style={{
								height: '18px',
								width: '18px',
								border: '2px solid rgba(255, 255, 255, 0.5)',
								borderTop: '2px solid white',
								borderRadius: '50%',
								animation: 'spin 1s linear infinite'
							}} aria-hidden="true" />
						)}
						{isLoading ? 'Signing in...' : '🚀 Sign In'}
					</button>
				</form>

				<div style={{
					marginTop: '30px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					fontSize: '14px',
					color: '#666',
					padding: '20px 0',
					borderTop: '1px solid #e5e7eb'
				}}>
					<label style={{ 
						display: 'inline-flex', 
						alignItems: 'center', 
						gap: '8px',
						cursor: 'pointer'
					}}>
						<input 
							type="checkbox" 
							style={{ 
								borderRadius: '4px',
								width: '16px',
								height: '16px',
								cursor: 'pointer'
							}} 
						/> 
						Remember me
					</label>
					<a style={{
						color: '#667eea',
						textDecoration: 'none',
						fontWeight: '600',
						transition: 'all 0.3s ease'
					}} 
					href="#" 
					onClick={(e) => e.preventDefault()}
					onMouseEnter={(e) => e.target.style.color = '#764ba2'}
					onMouseLeave={(e) => e.target.style.color = '#667eea'}
					>
						Forgot password?
					</a>
				</div>
			</div>
		</div>
	);
} 