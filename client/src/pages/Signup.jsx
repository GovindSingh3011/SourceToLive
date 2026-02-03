import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
const Logo = '/S2L.svg';

const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Signup = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('register'); // register | verify
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
    const [pendingEmail, setPendingEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const otpRefs = useRef([]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            setPendingEmail(formData.email);
            setMode('verify');
            setSuccess('OTP sent to your email. Please verify to complete signup.');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpValue = otpDigits.join('');

        if (otpValue.length !== 6) {
            setError('Please enter the 6-digit verification code.');
            return;
        }

        if (formData.password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/api/auth/register/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: pendingEmail,
                    otp: otpValue,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            setSuccess('Registration complete! You can now sign in.');
            setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: ''
            });
            setConfirmPassword('');
            setOtpDigits(Array(6).fill(''));
            setMode('register');
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) {
            return;
        }

        const next = [...otpDigits];
        next[index] = value;
        setOtpDigits(next);
        setError('');

        if (value && index < otpRefs.current.length - 1) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!text) {
            return;
        }

        const next = Array(6).fill('');
        text.split('').forEach((char, idx) => {
            next[idx] = char;
        });
        setOtpDigits(next);
        const focusIndex = Math.min(text.length, 5);
        otpRefs.current[focusIndex]?.focus();
        e.preventDefault();
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential: credentialResponse.credential })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Google signup failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setSuccess('Google signup successful! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 800);
        } catch (err) {
            setError(err.message || 'Google signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google signup failed. Please try again.');
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="bg-linear-to-br flex flex-col items-center justify-center px-4 relative">
                <div className="w-full max-w-md relative z-10 mt-12 sm:mt-0">
                    <div className="flex justify-center items-center mb-4 sm:mb-6">
                        <img src={Logo} alt="SourceToLive Logo" className="h-12 sm:h-16 md:h-20 w-auto" />
                    </div>

                    <div
                        className="bg-white/80 backdrop-blur-xl border-2 border-transparent bg-clip-padding rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6 sm:p-8 md:p-10 hover:shadow-[0_12px_48px_rgba(59,125,195,0.15)] transition-all duration-300"
                        style={{
                            backgroundImage:
                                'linear-gradient(white, white), linear-gradient(135deg, rgba(59, 125, 195, 0.15), rgba(76, 175, 80, 0.15))',
                            backgroundOrigin: 'padding-box, border-box',
                            backgroundClip: 'padding-box, border-box'
                        }}
                    >
                        <div className="mb-6 sm:mb-8 md:mb-10 text-center">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight leading-tight">
                                Create Account
                            </h1>
                            <p className="text-gray-500 text-xs sm:text-sm md:text-base font-medium">
                                Join SourceToLive to deploy instantly
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                                <p className="text-red-700 text-xs sm:text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg">
                                <p className="text-emerald-700 text-xs sm:text-sm font-medium">{success}</p>
                            </div>
                        )}

                        {mode === 'register' && (
                            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
                                <div>
                                    <label
                                        htmlFor="firstName"
                                        className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2.5 uppercase tracking-wide"
                                    >
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-white border-2 border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#3B7DC3] focus:ring-4 focus:ring-[#3B7DC3]/10 transition-all duration-300 font-medium"
                                        placeholder="John"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="lastName"
                                        className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2.5 uppercase tracking-wide"
                                    >
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-white border-2 border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#3B7DC3] focus:ring-4 focus:ring-[#3B7DC3]/10 transition-all duration-300 font-medium"
                                        placeholder="Doe"
                                    />
                                </div>

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
                                        disabled={loading}
                                        className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-white border-2 border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#3B7DC3] focus:ring-4 focus:ring-[#3B7DC3]/10 transition-all duration-300 font-medium"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 sm:h-12 bg-linear-to-r from-[#3B7DC3] to-[#2A5F99] text-white text-xs sm:text-base font-bold rounded-lg hover:from-[#1F3A5F] hover:to-[#152B47] active:scale-[0.99] disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_4px_16px_rgba(59,125,195,0.25)] hover:shadow-[0_6px_24px_rgba(59,125,195,0.35)] hover:-translate-y-0.5 mt-4 sm:mt-6 uppercase tracking-wide"
                                >
                                    {loading ? 'Sending OTP...' : 'Create Account'}
                                </button>

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

                                <div className="w-full flex justify-center">
                                    <div className="hover:scale-105 transition-transform duration-300 w-full max-w-sm">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={handleGoogleError}
                                            theme="outline"
                                            size="large"
                                            width="100%"
                                            text="signup_with"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 sm:mt-8 text-center">
                                    <p className="text-gray-500 text-xs sm:text-base font-medium">
                                        Already have an account?{' '}
                                        <Link
                                            to="/login"
                                            className="font-bold text-[#3B7DC3] hover:text-[#1F3A5F] transition-colors underline decoration-2 underline-offset-2"
                                        >
                                            Sign In
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        )}

                        {mode === 'verify' && (
                            <form onSubmit={handleVerify} className="space-y-4 sm:space-y-5">
                                <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3">
                                    <p className="text-gray-600 text-xs sm:text-sm">We sent a verification code to</p>
                                    <p className="text-gray-900 font-semibold text-xs sm:text-sm">{pendingEmail}</p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="otp-0"
                                        className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2.5 uppercase tracking-wide"
                                    >
                                        Verification Code
                                    </label>
                                    <div className="grid grid-cols-6 gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
                                        {otpDigits.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => {
                                                    otpRefs.current[index] = el;
                                                }}
                                                id={`otp-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="one-time-code"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                disabled={loading}
                                                className="h-10 sm:h-12 w-full rounded-lg border-2 border-gray-200 bg-white text-center text-sm sm:text-base font-semibold text-gray-900 focus:outline-none focus:border-[#3B7DC3] focus:ring-4 focus:ring-[#3B7DC3]/10 transition-all duration-300"
                                                placeholder="•"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2.5 uppercase tracking-wide"
                                    >
                                        Set Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        disabled={loading}
                                        className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-white border-2 border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#3B7DC3] focus:ring-4 focus:ring-[#3B7DC3]/10 transition-all duration-300 font-medium"
                                        placeholder="Create a password"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">Minimum 6 characters</p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2.5 uppercase tracking-wide"
                                    >
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setError('');
                                        }}
                                        required
                                        minLength={6}
                                        disabled={loading}
                                        className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-white border-2 border-gray-200 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#3B7DC3] focus:ring-4 focus:ring-[#3B7DC3]/10 transition-all duration-300 font-medium"
                                        placeholder="Re-enter your password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 sm:h-12 bg-linear-to-r from-[#3B7DC3] to-[#2A5F99] text-white text-xs sm:text-base font-bold rounded-lg hover:from-[#1F3A5F] hover:to-[#152B47] active:scale-[0.99] disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_4px_16px_rgba(59,125,195,0.25)] hover:shadow-[0_6px_24px_rgba(59,125,195,0.35)] hover:-translate-y-0.5 mt-4 sm:mt-6 uppercase tracking-wide"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Complete Signup'}
                                </button>

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => {
                                        setMode('register');
                                        setOtpDigits(Array(6).fill(''));
                                        setConfirmPassword('');
                                        setError('');
                                    }}
                                    className="w-full h-10 sm:h-12 border-2 border-gray-200 text-gray-600 text-xs sm:text-base font-bold rounded-lg hover:border-[#3B7DC3] hover:text-[#3B7DC3] transition-all duration-300"
                                >
                                    Back to Registration
                                </button>
                            </form>
                        )}
                    </div>

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

export default Signup;
