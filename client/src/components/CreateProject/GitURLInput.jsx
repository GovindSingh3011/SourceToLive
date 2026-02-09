import { useState, useEffect, useRef } from 'react'

function GitURLInput({ onContinue, isLoading }) {
    const [publicRepoUrl, setPublicRepoUrl] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [repositories, setRepositories] = useState([])
    const [filteredRepositories, setFilteredRepositories] = useState([])
    const [selectedRepo, setSelectedRepo] = useState(null)
    const [error, setError] = useState('')
    const [isFetchingRepos, setIsFetchingRepos] = useState(true)
    const [showDropdown, setShowDropdown] = useState(false)
    const [retryCount, setRetryCount] = useState(0)
    const dropdownRef = useRef(null)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    useEffect(() => {
        // Fetch repositories on component mount
        fetchRepositories()
    }, [])

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const fetchRepositories = async (isRetry = false) => {
        try {
            setIsFetchingRepos(true)
            setError('')
            const token = localStorage.getItem('token')

            const response = await fetch(`${API_URL}/api/project/repositories/github`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                let errorMessage = errorData.message || errorData.error || 'Failed to fetch repositories'

                // Handle rate limiting with retry
                if (response.status === 429 && retryCount < 3) {
                    const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10)
                    setError(`Rate limited. Retrying in ${retryAfter} seconds...`)

                    setTimeout(() => {
                        setRetryCount(prev => prev + 1)
                        fetchRepositories(true)
                    }, retryAfter * 1000)
                    return
                }

                throw new Error(errorMessage)
            }

            const data = await response.json()
            const repos = data.repositories || []

            setRepositories(repos)
            setFilteredRepositories(repos)
            setRetryCount(0) // Reset retry count on success
        } catch (err) {
            setError(err.message)
            setRepositories([])
            setFilteredRepositories([])
        } finally {
            setIsFetchingRepos(false)
        }
    }

    const handleSearch = (query) => {
        setSearchQuery(query)
        if (!query.trim()) {
            setFilteredRepositories(repositories)
        } else {
            const filtered = repositories.filter(repo =>
                repo.fullName.toLowerCase().includes(query.toLowerCase()) ||
                repo.description?.toLowerCase().includes(query.toLowerCase())
            )
            setFilteredRepositories(filtered)
        }
    }

    const handleSelectRepo = (repo) => {
        setSelectedRepo(repo)
        setShowDropdown(false)
        setSearchQuery('')
        setError('')
    }

    const handleContinue = () => {
        // Check if either public URL is provided or a private repo is selected
        if (!publicRepoUrl.trim() && !selectedRepo) {
            setError('Please enter a public repository URL or select a private repository')
            return
        }

        if (publicRepoUrl.trim() && selectedRepo) {
            setError('Please choose either a public repository URL or a private repository, not both')
            return
        }

        setError('')

        if (publicRepoUrl.trim()) {
            let finalUrl = publicRepoUrl.trim()

            // Handle short format: owner/repo or owner/repo.git
            if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
                // Check if it's a valid owner/repo format
                const shortFormatPattern = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(.git)?$/
                if (!shortFormatPattern.test(finalUrl)) {
                    setError('Please enter a valid repository URL (e.g., owner/repo or https://github.com/owner/repo)')
                    return
                }
                // Convert short format to full GitHub URL
                finalUrl = `https://github.com/${finalUrl}`
            }

            // Validate full URL format
            const urlPattern = /^https?:\/\/.+/
            if (!urlPattern.test(finalUrl)) {
                setError('Please enter a valid repository URL')
                return
            }

            // Remove .git extension if present
            const cleanUrl = finalUrl.replace(/\.git$/, '')
            onContinue(cleanUrl)
        } else {
            // Use the HTTPS clone URL from selected private repo (already cleaned)
            onContinue(selectedRepo.cloneUrl)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && (publicRepoUrl.trim() || selectedRepo)) {
            handleContinue()
        }
    }

    return (
        <div className="flex justify-center w-full px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <div className="w-full max-w-3xl">
                {/* Main Card */}
                <div
                    className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-4 sm:p-6 md:p-8 lg:p-10 w-full animate-in fade-in slide-in-from-bottom-5 duration-300"
                    style={{
                        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(249,250,251,0.9))',
                    }}
                >
                    {/* Header Section */}
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                            <div className="inline-flex items-center justify-center w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 text-white text-xl sm:text-2xl shrink-0">
                                <svg className="w-5 sm:w-6 md:w-8 h-5 sm:h-6 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 m-0">Repository</h2>
                                <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1">Step 1 of 3</p>
                            </div>
                        </div>
                        <p className="text-gray-600 text-[11px] sm:text-xs md:text-sm leading-relaxed">Select your repository to get started with deployment. Enter a public URL or choose from your GitHub repositories.</p>
                        <div className="h-px bg-linear-to-r from-gray-200 via-gray-200 to-transparent mt-3 sm:mt-4 md:mt-6"></div>
                    </div>

                    {/* Public Repository URL Section */}
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <label htmlFor="publicRepoUrl" className="text-[10px] sm:text-xs font-bold text-gray-700 mb-2 sm:mb-2.5 md:mb-3 uppercase tracking-wide sm:tracking-wider md:tracking-widest flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <span className="inline-block w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-green-500 shrink-0"></span>
                            <span className="truncate">Public Repository URL</span>
                        </label>

                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                            <div className="relative flex-1">
                                <div className="absolute left-2.5 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <svg className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <input
                                    id="publicRepoUrl"
                                    type="text"
                                    value={publicRepoUrl}
                                    onChange={(e) => {
                                        setPublicRepoUrl(e.target.value)
                                        if (selectedRepo) setSelectedRepo(null)
                                        setError('')
                                    }}
                                    onKeyPress={handleKeyPress}
                                    placeholder="owner/repo or https://github.com/owner/repo"
                                    disabled={isLoading}
                                    className={`w-full h-9 sm:h-10 md:h-12 pl-8 sm:pl-10 md:pl-12 pr-2.5 sm:pr-3 md:pr-4 bg-white border-2 rounded-lg sm:rounded-xl text-gray-900 text-xs sm:text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 font-medium ${error && publicRepoUrl
                                        ? 'border-red-300 focus:border-red-500 focus:ring-2 sm:focus:ring-4 focus:ring-red-200/40'
                                        : 'border-gray-200 focus:border-green-500 focus:ring-2 sm:focus:ring-4 focus:ring-green-500/10'
                                        } ${isLoading ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''}`}
                                />
                            </div>
                            <button
                                onClick={handleContinue}
                                disabled={isLoading || !publicRepoUrl.trim()}
                                className="h-9 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-[10px] sm:text-xs md:text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-[0_8px_24px_rgba(59,125,195,0.35)] hover:-translate-y-0.5 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none uppercase tracking-wide sm:tracking-wider md:tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 shrink-0"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="hidden sm:inline">Validating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="hidden sm:inline">Continue</span>
                                        <span className="sm:hidden">Next</span>
                                        <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-gray-500 text-[10px] sm:text-xs mt-1.5 sm:mt-2 flex items-start gap-1.5 sm:gap-2">
                            <span className="shrink-0 mt-0.5 text-xs sm:text-sm">ℹ️</span>
                            <span>Enter a public repository URL (e.g., owner/repo, https://github.com/owner/repo, or any public repo URL)</span>
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wide sm:tracking-wider">Or</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* GitHub Repositories Section */}
                    <div>
                        <label htmlFor="repoSearch" className="text-[10px] sm:text-xs font-bold text-gray-700 mb-2 sm:mb-2.5 md:mb-3 uppercase tracking-wide sm:tracking-wider md:tracking-widest flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <span className="inline-block w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                            <span className="truncate">GitHub Repositories</span>
                        </label>

                        {isFetchingRepos ? (
                            <div className="w-full h-32 sm:h-40 md:h-48 flex items-center justify-center bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="animate-spin rounded-full h-3.5 sm:h-4 w-3.5 sm:w-4 border-2 border-blue-500 border-t-transparent"></div>
                                    <span className="text-xs sm:text-sm text-gray-600">Loading repositories...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="relative" ref={dropdownRef}>
                                {/* Search Input */}
                                <div className="relative mb-2.5 sm:mb-3 md:mb-4">
                                    <div className="absolute left-2.5 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <svg className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="repoSearch"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            if (publicRepoUrl) {
                                                setPublicRepoUrl('')
                                            }
                                            handleSearch(e.target.value)
                                            setShowDropdown(true)
                                        }}
                                        onFocus={() => {
                                            setShowDropdown(true)
                                            if (!searchQuery) {
                                                setFilteredRepositories(repositories)
                                            }
                                        }}
                                        placeholder="Search repositories..."
                                        disabled={isLoading}
                                        className={`w-full h-9 sm:h-10 md:h-12 pl-8 sm:pl-10 md:pl-12 pr-2.5 sm:pr-3 md:pr-4 bg-white border-2 rounded-lg sm:rounded-xl text-gray-900 text-xs sm:text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 font-medium ${error && selectedRepo
                                            ? 'border-red-300 focus:border-red-500 focus:ring-2 sm:focus:ring-4 focus:ring-red-200/40'
                                            : 'border-gray-200 focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10'
                                            } ${isLoading ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''}`}
                                    />
                                </div>

                                {/* Repositories List */}
                                {filteredRepositories.length > 0 ? (
                                    <div className="max-h-48 sm:max-h-56 md:max-h-64 overflow-y-auto border border-gray-200 rounded-lg sm:rounded-xl bg-gray-50/50">
                                        {filteredRepositories.map((repo) => (
                                            <button
                                                key={repo.id}
                                                onClick={() => {
                                                    setSelectedRepo(repo)
                                                    setShowDropdown(false)
                                                    setSearchQuery('')
                                                    setError('')
                                                    // cloneUrl already has .git removed by backend
                                                    onContinue(repo.cloneUrl)
                                                }}
                                                className="w-full px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-3 md:py-4 hover:bg-white border-b border-gray-200 last:border-b-0 text-left transition-colors group cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{repo.fullName}</p>
                                                        {repo.description && (
                                                            <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 line-clamp-1">{repo.description}</p>
                                                        )}
                                                    </div>
                                                    <span className={`shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-xs font-semibold ${repo.private
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {repo.private ? 'Private' : 'Public'}
                                                    </span>
                                                </div>
                                                {repo.language && (
                                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2">Language: {repo.language}</p>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ) : (repositories.length === 0 && error) ? (
                                    // Show nothing - error is displayed in the error section above
                                    null
                                ) : (repositories.length === 0) ? (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-5">
                                        <div className="flex gap-3">
                                            <span className="text-2xl shrink-0">ℹ️</span>
                                            <div>
                                                <p className="text-blue-900 text-xs sm:text-sm font-semibold m-0">Please connect your GitHub account first</p>
                                                <p className="text-blue-800 text-[10px] sm:text-xs mt-2">Please connect your GitHub account in your profile settings to import private repositories.</p>
                                                <button
                                                    onClick={() => {
                                                        window.location.href = '/profile'
                                                    }}
                                                    className="mt-2.5 inline-block px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-semibold rounded transition-colors"
                                                >
                                                    Go to GitHub Integration
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-3 sm:px-4 py-6 sm:py-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg sm:rounded-xl">
                                        <p className="text-xs sm:text-sm text-gray-600">No repositories found</p>
                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Try adjusting your search or use a public repository URL above</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="text-gray-500 text-[10px] sm:text-xs mt-2 sm:mt-3 md:mt-4 flex items-start gap-1.5 sm:gap-2">
                            <span className="shrink-0 mt-0.5 text-xs sm:text-sm">ℹ️</span>
                            <span>Showing all your GitHub repositories (public & private). Click on a repository to import it.</span>
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={`mt-4 sm:mt-5 md:mt-6 p-2.5 sm:p-3 md:p-4 border rounded-lg sm:rounded-xl flex gap-2 sm:gap-3 animate-in slide-in-from-top-2 duration-300 ${(error.toLowerCase().includes('token') || error.toLowerCase().includes('connect'))
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-red-50 border-red-200'
                            }`}>
                            <span className={`text-base sm:text-lg md:text-xl shrink-0 mt-0.5 ${(error.toLowerCase().includes('token') || error.toLowerCase().includes('connect'))
                                    ? ''
                                    : ''
                                }`}>
                                {(error.toLowerCase().includes('token') || error.toLowerCase().includes('connect')) ? 'ℹ️' : '⚠️'}
                            </span>
                            <div>
                                <p className={`text-[11px] sm:text-xs md:text-sm font-medium m-0 ${(error.toLowerCase().includes('token') || error.toLowerCase().includes('connect'))
                                        ? 'text-blue-900'
                                        : 'text-red-900'
                                    }`}>
                                    {error}
                                </p>
                                {(error.toLowerCase().includes('token') || error.toLowerCase().includes('connect')) && (
                                    <div className="text-blue-800 text-[10px] sm:text-xs mt-1.5 sm:mt-2 space-y-1.5 sm:space-y-2">
                                        <p>Please connect your GitHub account in your profile settings to import private repositories.</p>
                                        <button
                                            onClick={() => {
                                                window.location.href = '/profile'
                                            }}
                                            className="inline-block px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-semibold rounded transition-colors"
                                        >
                                            Go to GitHub Integration
                                        </button>
                                    </div>
                                )}
                                {error.toLowerCase().includes('too many requests') && (
                                    <div className="text-red-800 text-[10px] sm:text-xs mt-1.5 sm:mt-2 space-y-1.5 sm:space-y-2">
                                        <p>💡 GitHub API rate limit exceeded. Solutions:</p>
                                        <ul className="list-disc list-inside ml-0">
                                            <li>Wait a few minutes and try again</li>
                                            <li>Or use a public repository URL above</li>
                                            <li>Ensure your GitHub token is valid</li>
                                        </ul>
                                        <button
                                            onClick={() => {
                                                setRetryCount(0)
                                                fetchRepositories()
                                            }}
                                            className="mt-1.5 sm:mt-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-semibold rounded transition-colors"
                                        >
                                            Retry Now
                                        </button>
                                    </div>
                                )}
                                {error.toLowerCase().includes('retrying') && (
                                    <p className="text-red-800 text-[10px] sm:text-xs mt-1">🔄 Please wait, attempting to fetch repositories...</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Selected Repository Card */}
                    {selectedRepo && (
                        <div className="mt-4 sm:mt-5 md:mt-6 p-2.5 sm:p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <svg className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.544 2.914 1.19.092-.926.35-1.546.636-1.9-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.135 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                        </svg>
                                        <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{selectedRepo.fullName}</p>
                                    </div>
                                    {selectedRepo.description && (
                                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1.5 sm:mt-2">{selectedRepo.description}</p>
                                    )}
                                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-xs font-semibold ${selectedRepo.private
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {selectedRepo.private ? 'Private' : 'Public'}
                                        </span>
                                        {selectedRepo.language && (
                                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-xs bg-gray-200 text-gray-700">{selectedRepo.language}</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedRepo(null)}
                                    className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default GitURLInput
