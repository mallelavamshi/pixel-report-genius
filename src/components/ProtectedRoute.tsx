
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // No user logged in, redirect to login
  if (!user) {
    console.log('Protected route: No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is logged in but route requires admin and user is not admin
  if (requireAdmin && !isAdmin) {
    console.log('Protected route: Admin required but user is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // User is logged in and meets requirements (either admin not required or user is admin)
  return <>{children}</>;
};

export default ProtectedRoute;
