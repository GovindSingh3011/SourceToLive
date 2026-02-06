import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="w-full flex flex-col items-center justify-center min-h-screen px-4 py-8">
            {/* Icon */}
            <div className="mb-4 md:mb-6">
                <svg width="112.5" height="112.5" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="250" cy="250" r="210" stroke="black" stroke-width="28"/>
                    <path d="M225 100H275L268 310H232L225 100Z" fill="black"/>
                    <circle cx="250" cy="370" r="30" fill="black"/>
                </svg>
            </div>

            {/* Error Code */}
            <h1 className="text-[4.69125rem] md:text-[7.4844rem] font-bold text-gray-900 mb-2 md:mb-4">
                404
            </h1>

            {/* Heading */}
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4 text-center">
                Page Not Found
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-center max-w-md md:max-w-lg mb-8 md:mb-10 text-sm md:text-base leading-relaxed">
                <span className="font-bold">Oops!</span> The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect. Let's get you back on track.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto justify-center">
                <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-gradient-to-r from-[#3B7DC3] to-[#2A5F99] text-white font-semibold rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-sm md:text-base"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                    Back to Home
                </Link>

                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-white border-2 border-gray-200 text-gray-900 font-semibold rounded-lg hover:border-[#3B7DC3] hover:text-[#3B7DC3] transition-all duration-300 text-sm md:text-base"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Go Back
                </button>
            </div>

            {/* Additional Info */}
            <div className="mt-12 md:mt-16 text-center">
                <p className="text-gray-500 text-xs md:text-sm mb-3 md:mb-4">
                    Need help? Contact our support team
                </p>
                <a
                    href="mailto:contact.sourcetolive@gmail.com"
                    className="text-[#3B7DC3] hover:text-[#2A5F99] font-medium text-sm md:text-base transition-colors"
                >
                    contact.sourcetolive@gmail.com
                </a>
            </div>
        </div>
    );
};

export default NotFound;
