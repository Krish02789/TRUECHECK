import { Routes, Route, Navigate } from 'react-router-dom';
import RoleSelect from './pages/RoleSelect';
import AdminLogin from './pages/AdminLogin';
import CandidateLogin from './pages/CandidateLogin';
import Dashboard from './pages/Dashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<RoleSelect />} />
			<Route path="/admin/login" element={<AdminLogin />} />
			<Route path="/candidate/login" element={<CandidateLogin />} />
			<Route
				path="/admin/dashboard"
				element={
					<ProtectedRoute role="admin">
						<Dashboard />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/candidate/dashboard"
				element={
					<ProtectedRoute role="candidate">
						<CandidateDashboard />
					</ProtectedRoute>
				}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}