const About = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
            {/* Hero Section */}
            <div className="text-center mb-12 sm:mb-16 lg:mb-20 mt-6 sm:mt-10 lg:mt-16 relative">
                {/* Decorative Gradient Orbs */}
                <div className="hidden lg:block absolute top-20 left-1/4 w-72 sm:w-80 md:w-96 h-72 sm:h-80 md:h-96 bg-linear-to-br from-blue-400/20 to-transparent rounded-full blur-3xl -z-10"></div>
                <div className="hidden lg:block absolute top-40 right-1/4 w-72 sm:w-80 md:w-96 h-72 sm:h-80 md:h-96 bg-linear-to-br from-green-400/20 to-transparent rounded-full blur-3xl -z-10"></div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_4px_16px_rgba(15,23,42,0.08)] mb-6 sm:mb-8">
                    <span className="w-2 h-2 rounded-full bg-linear-to-r from-[#3B7DC3] to-[#4CAF50] animate-pulse"></span>
                    <span className="text-xs sm:text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
                        About SourceToLive
                    </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 leading-tight sm:leading-[1.15] tracking-tight mb-3 sm:mb-5 lg:mb-6">
                    SourceToLive
                    <br />
                    <span className="bg-linear-to-r from-[#3B7DC3] to-[#4CAF50] bg-clip-text text-transparent">
                        From Git to Live
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-xs sm:text-sm md:text-base lg:text-lg font-medium text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 lg:mb-10 px-1 sm:px-2">
                    A deployment platform built by students, for developers who value momentum.
                    Clear steps, transparent systems, and reliable outcomes from Git commit to live application.
                </p>
            </div>

            {/* What is SourceToLive - Split Layout */}
            <div className="mb-12 sm:mb-16 lg:mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3B7DC3]/10 border border-[#3B7DC3]/20 mb-4">
                            <span className="text-xs font-bold text-[#3B7DC3] uppercase tracking-wide">What We Built</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                            A Modern Deployment Platform
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed mb-3 sm:mb-4">
                            SourceToLive transforms a Git repository into a live, secure, and optimized web application in minutes.
                            It automates the complete deployment lifecycle - build, configuration, hosting, and delivery - into a
                            streamlined and reliable workflow.
                        </p>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                            Instead of managing servers, reverse proxies, SSL certificates, and manual deployment scripts,
                            developers push code and go live. That's it.
                        </p>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="relative group">
                            <div className="absolute -inset-2 sm:-inset-4 bg-linear-to-r from-[#3B7DC3]/20 to-[#4CAF50]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                            <div className="relative p-6 sm:p-8 lg:p-10 bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                                <div className="flex items-center justify-center text-5xl sm:text-6xl lg:text-7xl mb-3 sm:mb-4">⚡</div>
                                <div className="text-center">
                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-[#3B7DC3] to-[#4CAF50] bg-clip-text text-transparent">
                                        Source → Live
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-2">One command, instant deployment</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Who It's For - Cards */}
            <div className="mb-12 sm:mb-16 lg:mb-20">
                <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4CAF50]/10 border border-[#4CAF50]/20 mb-4">
                        <span className="text-xs font-bold text-[#4CAF50] uppercase tracking-wide">Who We Serve</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-3 sm:mb-4">
                        Built for Builders Who Ship
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                    {[
                        { icon: '👨‍💻', title: 'Solo Developers', desc: 'Shipping side projects' },
                        { icon: '🎓', title: 'Student Builders', desc: 'Academic & portfolio work' },
                        { icon: '👥', title: 'Small Teams', desc: 'Fast iteration cycles' },
                        { icon: '📚', title: 'Learning Devs', desc: 'Exploring DevOps & cloud' }
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="group p-4 sm:p-5 lg:p-6 bg-white/80 backdrop-blur-xl border-2 border-transparent rounded-xl sm:rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_rgba(59,125,195,0.15)] hover:border-[#3B7DC3]/20 transition-all duration-300 text-center"
                        >
                            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{item.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* The Story - Timeline Style */}
            <div className="mb-12 sm:mb-16 lg:mb-20">
                <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3B7DC3]/10 border border-[#3B7DC3]/20 mb-4">
                        <span className="text-xs font-bold text-[#3B7DC3] uppercase tracking-wide">Our Story</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-2 sm:mb-3 lg:mb-4">
                        Born from Real Developer Frustration
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base lg:text-[16px] font-medium text-gray-600 max-w-2xl mx-auto px-1 sm:px-2">
                        Every great solution starts with a problem worth solving
                    </p>
                </div>

                <div className="relative">
                    {/* Timeline Line */}
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-[#3B7DC3] via-[#4CAF50] to-[#3B7DC3] opacity-20"></div>

                    <div className="space-y-6 sm:space-y-8 lg:space-y-12">
                        {/* Problem */}
                        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
                            <div className="lg:text-right lg:pr-12">
                                <div className="block px-3 py-1.5 sm:px-4 sm:py-2 bg-red-50 border border-red-200 rounded-lg mb-3 sm:mb-4 w-fit lg:ml-auto">
                                    <span className="text-xs sm:text-sm font-bold text-red-600">😤 The Problem</span>
                                </div>
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                                    Deployment Was Always the Hard Part
                                </h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                                    Every project meant wrestling with build commands, Nginx configs, SSL certificates,
                                    reverse proxies, and PM2. Hours lost that should have been spent building features.
                                </p>
                            </div>
                            <div className="lg:pl-12">
                                <div className="p-4 sm:p-5 lg:p-6 bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border-2 border-red-100 shadow-[0_8px_32px_rgba(239,68,68,0.1)]">
                                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-500">✗</span>
                                            <span>Manual build commands</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-500">✗</span>
                                            <span>Complex hosting setup</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-500">✗</span>
                                            <span>SSL certificate management</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-500">✗</span>
                                            <span>Reverse proxy configuration</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Timeline dot */}
                            <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                        </div>

                        {/* Motivation */}
                        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
                            <div className="order-2 lg:order-1 lg:pr-12">
                                <div className="p-4 sm:p-5 lg:p-6 bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border-2 border-[#3B7DC3]/20 shadow-[0_8px_32px_rgba(59,125,195,0.1)]">
                                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#3B7DC3]">→</span>
                                            <span className="font-semibold">Ship faster</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#3B7DC3]">→</span>
                                            <span className="font-semibold">Learn faster</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#3B7DC3]">→</span>
                                            <span className="font-semibold">Iterate faster</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#3B7DC3]">→</span>
                                            <span className="font-semibold">Focus on product</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2 lg:pl-12">
                                <div className="block px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 border border-[#3B7DC3]/30 rounded-lg mb-3 sm:mb-4 lg:mb-6 w-fit">
                                    <span className="text-xs sm:text-sm font-bold text-[#3B7DC3]">💡 The Motivation</span>
                                </div>
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 mt-2">
                                    We Wanted to Keep Our Momentum
                                </h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                                    As final-year BTech CSE students, we knew cloud tech and DevOps. We wanted our major
                                    project to solve a real problem: Git URL → Live link, without the fragile checklist.
                                </p>
                            </div>
                            {/* Timeline dot */}
                            <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#3B7DC3] rounded-full border-4 border-white shadow-lg z-10"></div>
                        </div>

                        {/* Solution */}
                        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
                            <div className="lg:text-right lg:pr-12">
                                <div className="block px-3 py-1.5 sm:px-4 sm:py-2 bg-green-50 border border-[#4CAF50]/30 rounded-lg mb-3 sm:mb-4 lg:mb-6 w-fit lg:ml-auto">
                                    <span className="text-xs sm:text-sm font-bold text-[#4CAF50]">✓ The Solution</span>
                                </div>
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 mt-2">
                                    SourceToLive Was Born
                                </h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                                    A platform where deployment stops being a chore and becomes invisible.
                                    Push your code. We handle the rest. That's the promise.
                                </p>
                            </div>
                            <div className="lg:pl-12">
                                <div className="p-4 sm:p-5 lg:p-6 bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border-2 border-[#4CAF50]/20 shadow-[0_8px_32px_rgba(76,175,80,0.1)]">
                                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#4CAF50]">✓</span>
                                            <span>Automated builds</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#4CAF50]">✓</span>
                                            <span>Instant deployment</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#4CAF50]">✓</span>
                                            <span>Automatic SSL</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#4CAF50]">✓</span>
                                            <span>Zero config required</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Timeline dot */}
                            <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#4CAF50] rounded-full border-4 border-white shadow-lg z-10"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Philosophy - Grid Cards */}
            <div className="mb-12 sm:mb-16 lg:mb-20">
                <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4CAF50]/10 border border-[#4CAF50]/20 mb-4">
                        <span className="text-xs font-bold text-[#4CAF50] uppercase tracking-wide">Philosophy</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-2 sm:mb-3 lg:mb-4">
                        Source → Live: A Straight Path
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base lg:text-[16px] font-medium text-gray-600 max-w-2xl mx-auto px-1 sm:px-2">
                        Our name is our promise: code moves in one clean line from repository to production
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                    {[
                        { icon: '🎯', title: 'Simplicity', desc: 'Remove obstacles, not add features' },
                        { icon: '⚙️', title: 'Automation', desc: 'Let machines do the repetitive work' },
                        { icon: '🔍', title: 'Transparency', desc: 'Clear status, no hidden steps' },
                        { icon: '🛡️', title: 'Reliability', desc: 'Predictable outcomes every time' }
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="group p-4 sm:p-5 lg:p-6 bg-white/80 backdrop-blur-xl border-2 border-transparent rounded-xl sm:rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_rgba(76,175,80,0.15)] hover:border-[#4CAF50]/20 transition-all duration-300"
                        >
                            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{item.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mission - Large Impact Statement */}
            <div className="mb-12 sm:mb-16 lg:mb-20">
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-[#3B7DC3]/20 p-6 sm:p-10 lg:p-16 shadow-[0_16px_48px_rgba(59,125,195,0.15)]">
                    <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-linear-to-br from-[#3B7DC3]/10 to-transparent rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-linear-to-tr from-[#4CAF50]/10 to-transparent rounded-full blur-3xl"></div>

                    <div className="relative text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3B7DC3]/10 border border-[#3B7DC3]/20 mb-4 sm:mb-6">
                            <span className="text-xs font-bold text-[#3B7DC3] uppercase tracking-wide">Our Mission</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4 sm:mb-6">
                            Make Shipping Feel
                            <br />
                            <span className="bg-linear-to-r from-[#3B7DC3] to-[#4CAF50] bg-clip-text text-transparent">
                                Normal, Not Heroic
                            </span>
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8">
                            Great ideas should not be delayed by deployment complexity. SourceToLive reduces the gap
                            between idea and impact, enables consistent production-grade deployments, empowers students
                            and independent developers, and encourages faster experimentation.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-[#3B7DC3]/10 to-[#4CAF50]/10 rounded-lg sm:rounded-xl border border-[#3B7DC3]/20">
                            <span className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
                                If a project is worth building, it should be easy to share with the world.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* About the Creators - Team Section */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl bg-linear-to-r from-[#3B7DC3] to-[#4CAF50] p-6 sm:p-10 lg:p-12 shadow-[0_16px_48px_rgba(59,125,195,0.3)]">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

                <div className="relative z-10">
                    <div className="text-center mb-6 sm:mb-8 lg:mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs sm:text-[13px] font-semibold text-white uppercase tracking-wide mb-4 sm:mb-6">
                            Meet the Team
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3 sm:mb-4">
                            Built by BTech CS Students, Built for Real Impact
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg font-medium text-white/95 leading-relaxed max-w-3xl mx-auto">
                            A final-year major project that solves real developer problems
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="p-4 sm:p-5 lg:p-6 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <div className="text-2xl sm:text-3xl">🎓</div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">Academic Excellence</h3>
                                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                                        Combining DevOps, cloud deployment, backend development, and infrastructure
                                        automation into one comprehensive system.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 sm:p-5 lg:p-6 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <div className="text-2xl sm:text-3xl">💻</div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">Real-World Impact</h3>
                                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                                        Not just theory - solving developer pain we personally experienced while
                                        building and deploying our own projects.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="mb-6 sm:mb-8">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-4 sm:mb-6">The Team</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                            {/* Team Member 1 */}
                            <a
                                href="https://www.linkedin.com/in/govindsingh3011/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 overflow-hidden mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 ring-2 ring-white/30">
                                    <img
                                        src="/team/govind-singh.jpg"
                                        className="w-full h-full object-cover object-top aspect-square"
                                        style={{objectPosition: 'center top'}}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white">GS</div>';
                                        }}
                                    />
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-white text-center">Govind Singh</p>
                                <div className="mt-1 sm:mt-2 text-white/70 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </div>
                            </a>
                            {/* Team Member 2 */}
                            <a
                                href="https://www.linkedin.com/in/soumyakumargupta/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 overflow-hidden mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 ring-2 ring-white/30">
                                    <img
                                        src="team/soumya-kumar.png"
                                        className="w-full h-full object-cover object-top aspect-square"
                                        style={{objectPosition: 'center top'}}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white">SK</div>';
                                        }}
                                    />
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-white text-center">Soumya Kumar Gupta</p>
                                <div className="mt-1 sm:mt-2 text-white/70 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </div>
                            </a>
                            {/* Team Member 3 */}
                            <a
                                href="https://www.linkedin.com/in/vansh-agarwal-66771925a/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 overflow-hidden mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 ring-2 ring-white/30">
                                    <img
                                        src="/team/vansh-agarwal.png"
                                        className="w-full h-full object-cover object-top aspect-square"
                                        style={{objectPosition: 'center top'}}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white">VA</div>';
                                        }}
                                    />
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-white text-center">Vansh Agarwal</p>
                                <div className="mt-1 sm:mt-2 text-white/70 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </div>
                            </a>
                            {/* Team Member 4 */}
                            <a
                                href="https://www.linkedin.com/in/aviral-mishra-bb5706262/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 overflow-hidden mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 ring-2 ring-white/30">
                                    <img
                                        src="/team/aviral-mishra.jpeg"
                                        className="w-full h-full object-cover object-top aspect-square"
                                        style={{objectPosition: 'center top'}}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white">AM</div>';
                                        }}
                                    />
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-white text-center">Aviral Mishra</p>
                                <div className="mt-1 sm:mt-2 text-white/70 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </div>
                            </a>
                            {/* Team Member 5 */}
                            <a
                                href="https://www.linkedin.com/in/akshat-kushwaha-08a448274/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 overflow-hidden mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 ring-2 ring-white/30">
                                    <img
                                        src="/team/akshat-kushwaha.jpeg"
                                        className="w-full h-full object-cover object-top aspect-square"
                                        style={{objectPosition: 'center top'}}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white">AK</div>';
                                        }}
                                    />
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-white text-center">Akshat Kushwaha</p>
                                <div className="mt-1 sm:mt-2 text-white/70 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </div>
                            </a>
                            {/* Team Member 6 */}
                            <a
                                href="https://www.linkedin.com/in/jatin-kumarx-54734524a/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 overflow-hidden mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 ring-2 ring-white/30">
                                    <img
                                        src="/team/jatin-kumar.png"
                                        className="w-full h-full object-cover object-top aspect-square"
                                        style={{objectPosition: 'center top'}}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white">JK</div>';
                                        }}
                                    />
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-white text-center">Jatin Kumar</p>
                                <div className="mt-1 sm:mt-2 text-white/70 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </div>
                            </a>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 lg:p-8 bg-white/15 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/30 text-center">
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-white leading-relaxed mb-3 sm:mb-4">
                            "Build practical systems. Solve real problems. Learn by implementing complete
                            architectures end-to-end."
                        </p>
                        <p className="text-xs sm:text-sm text-white/90">
                            This is more than a project submission - it's our step toward becoming engineers who
                            build scalable, reliable, production-ready systems.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
