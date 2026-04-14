import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-950">
      <div className="text-center">
        <div className="text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-primary-700 mb-4">
          404
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-primary-400 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary gap-2">
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
export default NotFound;
