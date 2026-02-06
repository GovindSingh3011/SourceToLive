import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Home = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleGetStarted = () => {
        if (isLoggedIn) {
            navigate('/dashboard');
        } else {
            navigate('/signup');
        }
    };

    const features = [
        {
            icon: '⚡',
            title: 'Lightning Fast Deployments',
            description: 'Deploy your applications in seconds with our optimized build pipeline and global CDN network.'
        },
        {
            icon: '🔄',
            title: 'Continuous Deployment',
            description: 'Automatic deployments on every git push. Connect your repository and watch the magic happen.'
        },
        {
            icon: '🌐',
            title: 'Global Edge Network',
            description: 'Your apps served from the edge, ensuring the lowest latency for users worldwide.'
        },
        {
            icon: '📊',
            title: 'Real-time Analytics',
            description: 'Monitor your deployments with detailed logs and performance metrics in real-time.'
        },
        {
            icon: '🔒',
            title: 'Secure by Default',
            description: 'Automatic SSL certificates, DDoS protection, and secure environment variables.'
        },
        {
            icon: '🎯',
            title: 'Developer Friendly',
            description: 'Built for developers, by developers. Simple API, powerful CLI, and great documentation.'
        }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            {/* Hero Section */}
            <div className="text-center mb-16 sm:mb-20 mt-8 sm:mt-12 lg:mt-16 relative">
                {/* Decorative Gradient Orbs - Hidden on mobile */}
                <div className="hidden lg:block absolute top-20 left-1/4 w-72 sm:w-80 md:w-96 h-72 sm:h-80 md:h-96 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl -z-10"></div>
                <div className="hidden lg:block absolute top-40 right-1/4 w-72 sm:w-80 md:w-96 h-72 sm:h-80 md:h-96 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl -z-10"></div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_4px_16px_rgba(15,23,42,0.08)] mb-6 sm:mb-8">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#3B7DC3] to-[#4CAF50] animate-pulse"></span>
                    <span className="text-xs sm:text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
                        Cloud Deployment Platform
                    </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 leading-tight sm:leading-[1.15] tracking-tight mb-4 sm:mb-6">
                    Deploy Your Projects
                    <br />
                    <span className="bg-gradient-to-r from-[#3B7DC3] to-[#4CAF50] bg-clip-text text-transparent">
                        From Source to Live
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10 px-2 sm:px-0">
                    The fastest way to deploy your web applications. Connect your git repository
                    and deploy in seconds with automatic SSL, global CDN, and real-time updates.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <button
                        onClick={handleGetStarted}
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#3B7DC3] to-[#2A5F99] hover:from-[#1F3A5F] hover:to-[#152B47] text-white text-sm sm:text-[15px] font-bold uppercase tracking-wide rounded-lg shadow-[0_4px_16px_rgba(59,125,195,0.25)] hover:shadow-[0_6px_24px_rgba(59,125,195,0.35)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300"
                    >
                        {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
                    </button>
                    <button
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-[#3B7DC3] text-gray-700 hover:text-[#3B7DC3] text-xs sm:text-[13px] font-semibold rounded-lg transition-all duration-300"
                    >
                        Learn More
                    </button>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="mb-16 sm:mb-20">
                <div className="text-center mb-10 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-3 sm:mb-4">
                        Everything you need to deploy
                    </h2>
                    <p className="text-sm sm:text-base lg:text-[16px] font-medium text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
                        A complete platform with all the tools and features you need to build,
                        deploy, and scale your applications.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-6 sm:p-8 bg-white/80 backdrop-blur-xl border-2 border-transparent rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_rgba(59,125,195,0.15)] hover:border-[#3B7DC3]/20 transition-all duration-300"
                        >
                            <div className="text-4xl sm:text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-sm sm:text-[15px] font-medium text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* How It Works Section */}
            <div className="mb-16 sm:mb-20">
                <div className="text-center mb-10 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-3 sm:mb-4">
                        Deploy in three simple steps
                    </h2>
                    <p className="text-sm sm:text-base lg:text-[16px] font-medium text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
                        From repository to production in minutes
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
                    {[
                        {
                            step: '01',
                            title: 'Connect Repository',
                            description: 'Link your GitHub repository with just a few clicks'
                        },
                        {
                            step: '02',
                            title: 'Configure Build',
                            description: 'Set your build commands and environment variables'
                        },
                        {
                            step: '03',
                            title: 'Deploy & Scale',
                            description: 'Watch your app go live instantly on our global network'
                        }
                    ].map((step, index) => (
                        <div key={index} className="relative text-center">
                            <div className="inline-flex items-center justify-center w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-gradient-to-br from-[#3B7DC3] to-[#4CAF50] text-white text-lg sm:text-[20px] font-bold mb-4 sm:mb-6 shadow-lg">
                                {step.step}
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                                {step.title}
                            </h3>
                            <p className="text-sm sm:text-[15px] font-medium text-gray-600 leading-relaxed">
                                {step.description}
                            </p>
                            {index < 2 && (
                                <div className="hidden lg:block absolute top-7 sm:top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-[#3B7DC3]/30 to-[#4CAF50]/30"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#3B7DC3] to-[#4CAF50] p-8 sm:p-12 text-center shadow-[0_16px_48px_rgba(59,125,195,0.3)]">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3 sm:mb-4">
                        Ready to get started?
                    </h2>
                    <p className="text-sm sm:text-base lg:text-lg font-medium text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
                        Join thousands of developers who trust SourceToLive for their deployments
                    </p>
                    <button
                        onClick={handleGetStarted}
                        className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white text-[#3B7DC3] text-sm sm:text-[15px] font-bold uppercase tracking-wide rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-[0.98] transition-all duration-300"
                    >
                        {isLoggedIn ? 'Go to Dashboard' : 'Start Deploying Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
