import { Chrome } from 'lucide-react';

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
  // Redirect to backend Google OAuth endpoint (fallback to same-origin /api)
  window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      type="button"
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
    >
      <Chrome className="h-5 w-5" />
      <span className="font-medium">Continue with Google</span>
    </button>
  );
};

export default GoogleLoginButton;
