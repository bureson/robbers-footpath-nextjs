import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import LoadingSpinner from './loadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <LoadingSpinner />
  if (!user) return null;

  return <>{children}</>;
};

export default ProtectedRoute;