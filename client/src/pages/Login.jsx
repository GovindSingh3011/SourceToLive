import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
const Logo = '/S2L.svg';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Failed to connect to server. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential: credentialResponse.credential })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setError(data.message || 'Google login failed');
            }
        } catch (err) {
            setError('Failed to connect to server. Please try again.');
            console.error('Google login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google login failed. Please try again.');
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="bg-linear-to-br flex flex-col items-center justify-center relative">
                <div className="w-full max-w-md relative z-10">
                    {/* Header with centered logo */}
                    <div className="flex justify-center items-center mb-4 sm:mb-6">
                        <img src={Logo} alt="SourceToLive Logo" className="h-12 sm:h-16 md:h-20 w-auto" />
                    </div>

                    {/* Login Card */}
                    <div className="bg-white/80 backdrop-blur-xl border-2 border-transparent bg-clip-padding rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6 sm:p-8 md:p-10 hover:shadow-[0_12px_48px_rgba(59,125,195,0.15)] transition-all duration-300"
                        style={{
                            backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgba(59, 125, 195, 0.15), rgba(76, 175, 80, 0.15))',
                            backgroundOrigin: 'padding-box, border-box',
                            backgroundClip: 'padding-box, border-box'
                        }}>

                        {/* Logo/Heading */}
                        <div className="mb-6 sm:mb-8 md:mb-10 text-center">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight leading-tight">
                                Welcome Back
                            </h1>
                            <p className="text-gray-500 text-xs sm:text-sm md:text-base font-medium">
                                Sign in to deploy your projects instantly
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                                <p className="text-red-700 text-xs sm:text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                            {/* Email Input */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2.5 uppercase tracking-wide"
                                >
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-white border-2 border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#3B7DC3] focus:ring-4 focus:ring-[#3B7DC3]/10 transition-all duration-300 font-medium"
                                    placeholder="you@example.com"
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2.5 uppercase tracking-wide"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-white border-2 border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#3B7DC3] focus:ring-4 focus:ring-[#3B7DC3]/10 transition-all duration-300 font-medium"
                                    placeholder="Enter your password"
                                />
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-10 sm:h-12 bg-linear-to-r from-[#3B7DC3] to-[#2A5F99] text-white text-xs sm:text-base font-bold rounded-lg hover:from-[#1F3A5F] hover:to-[#152B47] active:scale-[0.99] disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_4px_16px_rgba(59,125,195,0.25)] hover:shadow-[0_6px_24px_rgba(59,125,195,0.35)] hover:-translate-y-0.5 mt-4 sm:mt-6 uppercase tracking-wide"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="hidden sm:inline">Logging in...</span>
                                        <span className="sm:hidden">Logging...</span>
                                    </span>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6 sm:my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs sm:text-sm">
                                <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        {/* Google Login Button */}
                        <div className="w-full flex justify-center">
                            <div className="hover:scale-105 transition-transform duration-300 w-full max-w-sm">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    theme="outline"
                                    size="large"
                                    width="100%"
                                    text="signin_with"
                                />
                            </div>
                        </div>

                        {/* Sign Up Link */}
                        <div className="mt-6 sm:mt-8 text-center">
                            <p className="text-gray-500 text-xs sm:text-base font-medium">
                                Don't have an account?{' '}
                                <Link
                                    to="/signup"
                                    className="font-bold text-[#3B7DC3] hover:text-[#1F3A5F] transition-colors underline decoration-2 underline-offset-2"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 sm:mt-8 text-center">
                        <p className="text-gray-400 text-xs flex items-center justify-center gap-2 flex-wrap">
                            <span>Secured by SourceToLive</span>
                            <span className="hidden sm:inline">•</span>
                            <span>© 2026</span>
                        </p>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Login;