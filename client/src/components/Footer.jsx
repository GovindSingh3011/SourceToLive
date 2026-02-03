import { Link } from 'react-router-dom';

const Logo = '/S2L.svg';

const Footer = () => {
    return (
        <footer className="w-full bg-white border-t border-gray-200 mt-auto">
            <div className="px-8 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left Side - Logo and Links */}
                    <div className="flex flex-col md:flex-row md:items-center items-center gap-6 md:gap-8 w-full md:w-auto">
                        {/* Logo */}
                        <Link to="/" className="flex items-center">
                            <img src={Logo} alt="SourceToLive Logo" className="h-8 w-auto" />
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-4 md:gap-6">
                            <Link
                                to="/"
                                className="text-gray-600 hover:text-[#3B7DC3] transition-colors text-sm font-medium"
                            >
                                Home
                            </Link>
                            <Link
                                to="/docs"
                                className="text-gray-600 hover:text-[#3B7DC3] transition-colors text-sm font-medium"
                            >
                                Docs
                            </Link>
                            <Link
                                to="/about"
                                className="text-gray-600 hover:text-[#3B7DC3] transition-colors text-sm font-medium"
                            >
                                About
                            </Link>
                        </div>
                    </div>

                    {/* Right Side - Copyright */}
                    <div className="text-gray-400 text-xs text-center md:text-right w-full md:w-auto">
                        <span>© 2026 SourceToLive. All rights reserved.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
