import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { connectSocket, disconnectSocket } from '../utils/socket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Connect socket if user is already logged in
    if (token && user) {
      connectSocket();
    }
    // Set loading to false after initial check
    const timer = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(timer);
  }, [token, user]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response;
      
      if (data.success) {
        const { token: newToken, user: newUser } = data;

        // Store in state and localStorage
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        // Connect socket
        connectSocket();

        toast.success(data.message || 'Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role
      });
      const { data } = response;
      
      if (data.success) {
        const { token: newToken, user: newUser } = data;

        // Store in state and localStorage
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        // Connect socket
        connectSocket();

        toast.success(data.message || 'Registration successful!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    setToken,
    setUser,
    isAuthenticated: !!token,
    isProjectManager: user?.role === 'Project Manager'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
