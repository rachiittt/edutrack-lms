import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiError } from '../utils/apiErrorHandler';
const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password, role);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getApiError(error, 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex">
      {}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-32 right-20 w-72 h-72 bg-accent-400/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-32 left-20 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <GraduationCap className="w-8 h-8" />
            </div>
            <span className="text-3xl font-bold">EduTrack</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Start Your <br />
            <span className="text-accent-300">Academic Adventure</span>
          </h2>
          <p className="text-lg text-primary-200 max-w-md leading-relaxed">
            Join thousands of learners and educators. Create courses, take quizzes,
            and track your progress.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-primary-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">EduTrack</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Create Account
          </h1>
          <p className="text-primary-400 mb-8">
            Join EduTrack to start learning today
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-12"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {}
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['student', 'teacher'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r as 'student' | 'teacher')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                      role === r
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                        : 'border-[#27272a] text-primary-400 hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="text-2xl mb-1">{r === 'student' ? '🎓' : '👨‍🏫'}</div>
                    <span className="text-sm font-semibold capitalize">{r}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-primary-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
