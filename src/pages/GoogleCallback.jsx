import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Google authentication failed');
        navigate('/login');
        return;
      }

      if (token) {
        try {
          // Store token
          localStorage.setItem('token', token);
          
          // Fetch user data
          const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setToken(token);
              setUser(data.data);
              localStorage.setItem('user', JSON.stringify(data.data));
              toast.success('Google login successful!');
              navigate('/dashboard');
            } else {
              throw new Error('Failed to fetch user data');
            }
          } else {
            throw new Error('Authentication failed');
          }
        } catch (error) {
          console.error('Google auth error:', error);
          toast.error('Authentication failed');
          navigate('/login');
        }
      } else {
        toast.error('No authentication token received');
        navigate('/login');
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, setToken, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google authentication...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
