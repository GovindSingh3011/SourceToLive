import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Logo = '/S2L.svg';

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Error parsing user data:', err);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setShowDropdown(false);
        navigate('/login');
    };

    return (
        <nav className="w-full bg-white/40 backdrop-blur-xl border-b border-white/40 shadow-[0_6px_30px_rgba(15,23,42,0.08)] sticky top-0 z-50">
            <div className="px-8 py-2">
                <div className="flex items-center justify-between">
                    {/* Left Side - Logo */}
                    <Link to="/" className="flex items-center">
                        <img src={Logo} alt="SourceToLive Logo" className="h-9 w-auto" />
                    </Link>

                    {/* Right Side - User Account */}
                    <div className="relative">
                        {user ? (
                            <div>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/60 bg-white/70 backdrop-blur-md shadow-[0_6px_16px_rgba(15,23,42,0.08)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)] hover:border-[#3B7DC3]/30 transition-all duration-200 group"
                                >
                                    {/* User Avatar with initials */}
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#3B7DC3] to-[#2A5F99] flex items-center justify-center shadow-sm ring-2 ring-white/70">
                                            <span className="text-white font-semibold text-[12px]">
                                                {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-semibold text-gray-900">
                                            {user.firstName || user.email?.split('@')[0]}
                                        </span>
                                        <svg
                                            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2.5}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-xl shadow-[0_16px_40px_rgba(15,23,42,0.18)] border border-white/60 py-2 animate-fadeIn">
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 border-b border-gray-100 bg-linear-to-br from-white/80 to-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#3B7DC3] to-[#2A5F99] flex items-center justify-center shadow-sm ring-2 ring-white/70">
                                                    <span className="text-white font-semibold text-[13px]">
                                                        {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-semibold text-gray-900 truncate">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            <Link
                                                to="/dashboard"
                                                className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#3B7DC3]/10 hover:text-[#2A5F99] rounded-lg transition-all duration-150"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                                Dashboard
                                            </Link>
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#3B7DC3]/10 hover:text-[#2A5F99] rounded-lg transition-all duration-150"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profile
                                            </Link>
                                        </div>

                                        {/* Logout Button */}
                                        <div className="border-t border-gray-100 pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#3B7DC3] transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-[#3B7DC3] rounded-lg hover:bg-[#2A5F99] transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
