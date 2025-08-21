import { Link } from 'react-router-dom';

export default function RoleSelect() {
	return (
		<div className="dashboard-page">
			<div className="glass-card dashboard-card" style={{ maxWidth: '800px' }}>
				<div style={{ textAlign: 'center', marginBottom: '40px' }}>
					<div style={{
						display: 'inline-flex',
						height: '80px',
						width: '80px',
						alignItems: 'center',
						justifyContent: 'center',
						borderRadius: '20px',
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						color: 'white',
						fontSize: '32px',
						fontWeight: '700',
						marginBottom: '24px',
						boxShadow: '0 12px 35px rgba(102, 126, 234, 0.3)'
					}}>🚀</div>
					<h1 className="title">Welcome to TrueCheck</h1>
					<p className="subtitle">Choose your portal to access the platform</p>
				</div>
				
				<div style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
					gap: '24px',
					marginTop: '20px'
				}}>
					<Link to="/candidate/login" style={{ textDecoration: 'none' }}>
						<div style={{
							background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
							border: '2px solid #e2e8f0',
							borderRadius: '20px',
							padding: '32px',
							textAlign: 'center',
							transition: 'all 0.3s ease',
							cursor: 'pointer',
							boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
						}}
						onMouseEnter={(e) => {
							e.target.style.transform = 'translateY(-8px)';
							e.target.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.15)';
							e.target.style.borderColor = '#667eea';
						}}
						onMouseLeave={(e) => {
							e.target.style.transform = 'translateY(0)';
							e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
							e.target.style.borderColor = '#e2e8f0';
						}}
						>
							<div style={{
								fontSize: '48px',
								marginBottom: '16px'
							}}>👨‍💼</div>
							<h2 style={{
								fontSize: '24px',
								fontWeight: '700',
								color: '#1e293b',
								marginBottom: '12px'
							}}>Candidate Portal</h2>
							<p style={{
								color: '#64748b',
								fontSize: '16px',
								lineHeight: '1.6',
								marginBottom: '24px'
							}}>Apply for positions, track your applications, and manage your professional profile with ease.</p>
							<div style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '8px',
								background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
								color: 'white',
								padding: '12px 24px',
								borderRadius: '12px',
								fontWeight: '600',
								fontSize: '16px',
								boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
								transition: 'all 0.3s ease'
							}}
							onMouseEnter={(e) => {
								e.target.style.transform = 'translateY(-2px)';
								e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
							}}
							onMouseLeave={(e) => {
								e.target.style.transform = 'translateY(0)';
								e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
							}}
							>
								🚀 Enter as Candidate
							</div>
						</div>
					</Link>
					
					<Link to="/admin/login" style={{ textDecoration: 'none' }}>
						<div style={{
							background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
							border: '2px solid #e2e8f0',
							borderRadius: '20px',
							padding: '32px',
							textAlign: 'center',
							transition: 'all 0.3s ease',
							cursor: 'pointer',
							boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
						}}
						onMouseEnter={(e) => {
							e.target.style.transform = 'translateY(-8px)';
							e.target.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.15)';
							e.target.style.borderColor = '#667eea';
						}}
						onMouseLeave={(e) => {
							e.target.style.transform = 'translateY(0)';
							e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
							e.target.style.borderColor = '#e2e8f0';
						}}
						>
							<div style={{
								fontSize: '48px',
								marginBottom: '16px'
							}}>🛡️</div>
							<h2 style={{
								fontSize: '24px',
								fontWeight: '700',
								color: '#1e293b',
								marginBottom: '12px'
							}}>Admin Portal</h2>
							<p style={{
								color: '#64748b',
								fontSize: '16px',
								lineHeight: '1.6',
								marginBottom: '24px'
							}}>Manage job postings, review applications, and oversee the recruitment process with powerful tools.</p>
							<div style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '8px',
								background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
								color: 'white',
								padding: '12px 24px',
								borderRadius: '12px',
								fontWeight: '600',
								fontSize: '16px',
								boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
								transition: 'all 0.3s ease'
							}}
							onMouseEnter={(e) => {
								e.target.style.transform = 'translateY(-2px)';
								e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
							}}
							onMouseLeave={(e) => {
								e.target.style.transform = 'translateY(0)';
								e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
							}}
							>
								⚡ Enter as Admin
							</div>
						</div>
					</Link>
				</div>
				
				<div style={{
					marginTop: '40px',
					textAlign: 'center',
					padding: '20px',
					borderTop: '1px solid #e5e7eb'
				}}>
					<p style={{
						color: '#64748b',
						fontSize: '14px',
						marginBottom: '8px'
					}}>© 2024 TrueCheck Platform</p>
					<p style={{
						color: '#94a3b8',
						fontSize: '12px'
					}}>Secure • Reliable • Professional</p>
				</div>
			</div>
		</div>
	);
} 