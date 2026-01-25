import { useState } from 'react';
import Carousel from '../components/Carousel.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import heroOne from '../assets/images/Hiphop.jfif';
import heroTwo from '../assets/images/Hiphop2.jfif';
import heroThree from '../assets/images/Hiphop1.jpg';

function Login({ onBackClick, initialMode = 'login', loginSource = null }) {
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [isForgot, setIsForgot] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const carouselImages = [heroOne, heroTwo, heroThree];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgot) {
        if (!formData.email || !formData.currentPassword || !formData.password || !formData.confirmPassword) {
          throw new Error('Please fill in all fields');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          throw new Error('Please enter a valid email');
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const response = await fetch(`${API_URL}/api/users/reset-password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, currentPassword: formData.currentPassword, password: formData.password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Password reset failed');
        }

        setSuccess('Password updated successfully. Please sign in with your new password.');
        setIsForgot(false);
        setIsSignUp(false);
        setFormData({ name: '', email: formData.email, password: '', confirmPassword: '' });
      } else if (isSignUp) {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          throw new Error('Please fill in all fields');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          throw new Error('Please enter a valid email');
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      } else {
        if (!formData.email || !formData.password) {
          throw new Error('Please fill in all fields');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          throw new Error('Please enter a valid email');
        }

        await login(formData.email, formData.password);
      }
    } catch (err) {
      setError(err.message || (isSignUp ? 'Sign up failed. Please try again.' : 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({ name: '', email: '', currentPassword: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-neutral-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-neutral-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-neutral-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>

      <div className="w-full max-w-5xl relative z-10">
        {/* Back Button */}
        <button
          onClick={onBackClick}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-all duration-300 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        {/* Main Card */}
        <div className="relative group">
          {/* Card Glow Effect */}
          <div className="absolute -inset-0.5 bg-linear-to-r from-neutral-200 to-neutral-100 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
          
          {/* Card Content */}
          <div className="relative bg-neutral-100 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-neutral-700 hover:border-neutral-600 transition-colors duration-300">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-stretch">
              <div>
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-linear-to-br from-black to-neutral-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">H</span>
                    </div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-black to-neutral-700 bg-clip-text text-transparent">
                      HERO
                    </h1>
                  </div>
                  <p className="text-neutral-800 text-sm">
                    {isForgot 
                      ? 'Reset your password'
                      : isSignUp 
                        ? 'Create your account and start shopping' 
                        : 'Welcome back to your account'}
                  </p>
                </div>

                {/* Info Message for Login Required */}
                {!isSignUp && !isForgot && !error && !success && loginSource === 'product-click' && (
                  <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg backdrop-blur-sm">
                    <p className="text-blue-400 text-sm font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Please login or create an account to view product details
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg backdrop-blur-sm">
                    <p className="text-red-400 text-sm font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg backdrop-blur-sm">
                    <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {success}
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Field - Only show in Sign Up */}
                  {isSignUp && (
                    <div className="group/input">
                      <label htmlFor="name" className="block text-sm font-semibold text-neutral-800 mb-2 group-focus-within/input:text-blue-400 transition-colors">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-neutral-100 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-neutral-500 text-neutral-800"
                      />
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="group/input">
                    <label htmlFor="email" className="block text-sm font-semibold text-neutral-800 mb-2 group-focus-within/input:text-neutral-400 transition-colors">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-neutral-100 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all placeholder:text-neutral-500 text-neutral-800"
                    />
                  </div>

                  {/* Current Password Field - Only show in Forgot Password mode */}
                  {isForgot && (
                    <div className="group/input">
                      <label htmlFor="currentPassword" className="block text-sm font-semibold text-neutral-800 mb-2 group-focus-within/input:text-neutral-400 transition-colors">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-neutral-100 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all placeholder:text-neutral-500 text-neutral-800"
                      />
                    </div>
                  )}

                  {/* Password Field */}
                  <div className="group/input">
                    <label htmlFor="password" className="block text-sm font-semibold text-neutral-800 mb-2 group-focus-within/input:text-neutral-400 transition-colors">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-neutral-100 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all placeholder:text-neutral-500 text-neutral-800"
                    />
                    {isSignUp && (
                      <p className="text-xs text-neutral-800 mt-2">At least 6 characters</p>
                    )}
                  </div>

                  {/* Confirm Password Field - Show in Sign Up and Forgot Password */}
                  {(isSignUp || isForgot) && (
                    <div className="group/input">
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-neutral-800 mb-2 group-focus-within/input:text-blue-400 transition-colors">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-neutral-100 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all placeholder:text-neutral-500 text-neutral-800"
                      />
                    </div>
                  )}

                  {/* Remember Me & Forgot Password - Only show in Login */}
                  {!isSignUp && !isForgot && (
                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 cursor-pointer group/checkbox">
                        <input
                          type="checkbox"
                          className="w-4 h-4 bg-neutral-100 border border-neutral-700 rounded checked:bg-neutral-600 checked:border-neutral-600 focus:ring-2 focus:ring-neutral -500 cursor-pointer"
                        />
                        <span className="text-sm text-neutral-800 group-hover/checkbox:text-neutral-500 transition-colors">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgot(true);
                          setError('');
                          setFormData({ name: '', email: '', currentPassword: '', password: '', confirmPassword: '' });
                        }}
                        className="text-sm text-neutral-800 hover:text-neutral-500 transition-colors font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Back to Login - Show in Forgot Password Mode */}
                  {isForgot && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgot(false);
                        setError('');
                        setFormData({ name: '', email: '', currentPassword: '', password: '', confirmPassword: '' });
                      }}
                      className="w-full text-center text-sm text-neutral-800 hover:text-neutral-500 transition-colors font-medium py-2"
                    >
                      ← Back to login
                    </button>
                  )}

                  {/* Terms & Conditions - Only show in Sign Up */}
                  {isSignUp && (
                    <label className="flex items-start gap-3 pt-2 cursor-pointer group/checkbox">
                      <input
                        type="checkbox"
                        className="w-4 h-4 bg-neutral-700 border border-neutral-600 rounded checked:bg-neutral-600 checked:border-neutral-600 focus:ring-2 focus:ring-neutral-500 cursor-pointer mt-0.5"
                      />
                      <span className="text-xs text-neutral-800 group-hover/checkbox:text-neutral-500 transition-colors">
                        I agree to the Terms of Service and Privacy Policy
                      </span>
                    </label>
                  )}

                  {/* Back to Login - Show in Sign Up Mode */}
                  {isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setError('');
                        setFormData({ name: '', email: '', currentPassword: '', password: '', confirmPassword: '' });
                      }}
                      className="w-full text-center text-sm text-neutral-700 hover:text-neutral-400 transition-colors font-medium py-2 mb-2"
                    >
                      ← Back to login
                    </button>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 py-3 px-4 bg-linear-to-r from-neutral-950 to-neutral-950 text-white font-semibold rounded-lg hover:from-neutral-850 hover:to-neutral-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-neutral-500/50 hover:shadow-2xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-neutral-400 to-neutral-300 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <span className="relative">
                      {loading 
                        ? (isForgot ? 'Resetting...' : isSignUp ? 'Creating Account...' : 'Signing in...') 
                        : (isForgot ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In')
                      }
                    </span>
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                  <div className="flex-1 h-px bg-linear-to-r from-transparent via-neutral-600 to-transparent"></div>
                  <span className="text-xs text-neutral-900 font-medium">or</span>
                  <div className="flex-1 h-px bg-linear-to-r from-transparent via-neutral-600 to-transparent"></div>
                </div>

                {/* Toggle Sign Up/Login */}
                {!isForgot && (
                  <p className="text-center text-neutral-800 text-sm">
                    {isSignUp 
                      ? 'Already have an account? ' 
                      : "Don't have an account? "}
                    <button
                      onClick={toggleMode}
                      className="text-neutral-700 hover:text-neutral-400 font-semibold transition-colors hover:underline"
                    >
                      {isSignUp ? 'Sign in here' : 'Sign up here'}
                    </button>
                  </p>
                )}
              </div>

              <div className="hidden lg:flex h-full self-stretch">
                <Carousel
                  images={carouselImages}
                  showControls={false}
                  useDefaultSizing={false}
                  className="h-full w-full rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-neutral-400 text-xs mt-8">
          By {isSignUp ? 'signing up' : 'signing in'}, you agree to our<br />
          <a href="#" className="text-neutral-300 hover:text-neutral-100 transition-colors">Terms of Service</a>
          {' and '}
          <a href="#" className="text-neutral-300 hover:text-neutral-100 transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
