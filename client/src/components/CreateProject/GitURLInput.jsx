import { useState } from 'react'

function GitURLInput({ onContinue, isLoading }) {
    const [gitUrl, setGitUrl] = useState('')
    const [error, setError] = useState('')

    const handleContinue = () => {
        // Basic URL validation
        if (!gitUrl.trim()) {
            setError('GitHub URL is required')
            return
        }

        if (!gitUrl.includes('github.com') && !gitUrl.includes('gitlab.com') && !gitUrl.includes('bitbucket.org')) {
            setError('Please enter a valid GitHub, GitLab, or Bitbucket URL')
            return
        }

        setError('')
        onContinue(gitUrl)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleContinue()
        }
    }

    return (
        <div className="flex justify-center items-center w-full px-3 sm:px-4 py-4 sm:py-6 min-w-0">
            <div
                className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-6 sm:p-8 md:p-10 w-full max-w-xl min-w-0 animate-in fade-in slide-in-from-bottom-5 duration-300"
                style={{
                    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(249,250,251,0.9))',
                }}
            >
                {/* Header Section */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 text-white text-xl sm:text-2xl shrink-0">
                            <svg className="w-6 sm:w-8 h-6 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 m-0">Repository</h2>
                            <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1">Step 1 of 3</p>
                        </div>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">Enter your repository URL from GitHub, GitLab to get started with deployment.</p>
                    <div className="h-px bg-linear-to-r from-gray-200 via-gray-200 to-transparent mt-4 sm:mt-6"></div>
                </div>

                {/* Input Section */}
                <div className="mb-5 sm:mb-6">
                    <label htmlFor="gitUrl" className="text-xs font-bold text-gray-700 mb-2 sm:mb-3 uppercase tracking-widest flex items-center gap-2 min-w-0">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                        <span className="truncate">Repository URL</span>
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <input
                            id="gitUrl"
                            type="text"
                            value={gitUrl}
                            onChange={(e) => {
                                setGitUrl(e.target.value)
                                setError('')
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="https://github.com/username/repo"
                            disabled={isLoading}
                            className={`w-full h-11 sm:h-12 pl-10 sm:pl-12 pr-3 sm:pr-4 bg-white border-2 rounded-lg sm:rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 font-medium ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-200/40'
                                : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                } ${isLoading ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''}`}
                        />
                    </div>
                    <p className="text-gray-500 text-xs mt-2 flex items-start gap-2">
                        <span className="shrink-0 mt-0.5">ℹ️</span>
                        <span>Supports GitHub and GitLab repositories</span>
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl flex gap-2 sm:gap-3 animate-in slide-in-from-top-2 duration-300">
                        <span className="text-lg sm:text-xl shrink-0 mt-0.5">⚠️</span>
                        <div>
                            <p className="text-red-900 text-xs sm:text-sm font-medium m-0">{error}</p>
                        </div>
                    </div>
                )}

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    disabled={isLoading || !gitUrl.trim()}
                    className="w-full h-11 sm:h-12 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-[0_8px_24px_rgba(59,125,195,0.35)] hover:-translate-y-0.5 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="hidden sm:inline">Validating...</span>
                            <span className="sm:hidden">Validating</span>
                        </>
                    ) : (
                        <>
                            <span className="hidden sm:inline">Continue</span>
                            <span className="sm:hidden">Next</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default GitURLInput
