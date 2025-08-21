import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, role = 'admin' }) {
	const storageKey = role === 'candidate' ? 'isCandidate' : 'isAdmin';
	const isAllowed = localStorage.getItem(storageKey) === 'true';
	const redirectTo = role === 'candidate' ? '/candidate/login' : '/admin/login';
	return isAllowed ? children : <Navigate to={redirectTo} replace />;
} 