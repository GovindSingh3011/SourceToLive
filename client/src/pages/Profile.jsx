import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function Profile() {
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [githubStatus, setGithubStatus] = useState(null)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [activeTab, setActiveTab] = useState('account')
    const [authorizingGitHub, setAuthorizingGitHub] = useState(false)
    const [removingToken, setRemovingToken] = useState(false)

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }

        fetchUserData(token)
        fetchGitHubStatus(token)

        // Check for GitHub OAuth callback messages
        const params = new URLSearchParams(location.search)
        if (params.get('github_connected')) {
            setMessage({ type: 'success', text: 'GitHub account connected successfully!' })
            setTimeout(() => setMessage(null), 3000)
            // Clean up URL
            navigate('/profile', { replace: true })
        }
        if (params.get('error')) {
            setMessage({ type: 'error', text: params.get('error') })
            setTimeout(() => setMessage(null), 5000)
            navigate('/profile', { replace: true })
        }
    }, [navigate, location])

    const fetchUserData = async (token) => {
        try {
            setLoading(true)
            const response = await fetch(`${apiUrl}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login')
                    return
                }
                throw new Error('Failed to fetch user data')
            }

            const data = await response.json()
            setUser(data.user)
            setError(null)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching user data:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchGitHubStatus = async (token) => {
        try {
            const response = await fetch(`${apiUrl}/api/auth/github-token/status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                console.error('Failed to fetch GitHub status')
                return
            }

            const data = await response.json()
            setGithubStatus(data)
        } catch (err) {
            console.error('Error fetching GitHub status:', err)
        }
    }

    const handleGitHubOAuth = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }

        try {
            setAuthorizingGitHub(true)
            const response = await fetch(`${apiUrl}/api/auth/github/oauth?returnTo=/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const error = await response.json()
                setMessage({ type: 'error', text: error.message || 'Failed to initiate GitHub OAuth' })
                return
            }

            const data = await response.json()
            // Redirect to GitHub OAuth URL
            window.location.href = data.authUrl
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
            console.error('Error initiating GitHub OAuth:', err)
        } finally {
            setAuthorizingGitHub(false)
        }
    }

    const handleRemoveGithubToken = async () => {
        if (!window.confirm('Are you sure you want to disconnect your GitHub account?')) {
            return
        }

        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }

        try {
            setRemovingToken(true)
            const response = await fetch(`${apiUrl}/api/auth/github-token`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to remove GitHub token')
            }

            setMessage({ type: 'success', text: 'GitHub account disconnected' })
            setGithubStatus({ hasToken: false })

            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000)
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
            console.error('Error removing GitHub token:', err)
        } finally {
            setRemovingToken(false)
        }
    }

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl p-8 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
                    <p className="text-gray-600 mb-6">{error || 'Profile not found'}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50">
            {/* Header */}
            <div className="relative overflow-hidden border-b border-gray-200/70 bg-white/80 backdrop-blur-sm">
                <div className="absolute inset-0 bg-linear-to-br from-blue-100/40 via-purple-50/20 to-transparent" />
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-fit text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </button>
                        <h1 className="text-4xl sm:text-5xl font-extrabold bg-linear-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                            Profile Settings
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Manage your account and integrations
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-8">
                    <div className="flex gap-2 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'account'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Account
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('github')}
                            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'github'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.29 6.8 5.47 7.9.4.08.55-.18.55-.39 0-.2-.01-.73-.01-1.44-2.01.45-2.53-.9-2.69-1.3-.09-.23-.48-.94-.82-1.13-.28-.16-.68-.55-.01-.56.63-.01 1.08.6 1.23.85.72 1.25 1.87.9 2.33.69.07-.54.28-.9.51-1.11-1.78-.2-3.64-.92-3.64-4.09 0-.9.31-1.64.82-2.22-.08-.2-.36-1.03.08-2.15 0 0 .67-.22 2.2.85.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.07 2.2-.85 2.2-.85.44 1.12.16 1.95.08 2.15.51.58.82 1.32.82 2.22 0 3.18-1.87 3.88-3.65 4.08.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.47.55.39C13.71 15.13 16 12.01 16 8.33 16 3.73 12.42 0 8 0Z" />
                                </svg>
                                GitHub Integration
                            </span>
                        </button>
                    </div>
                </div>

                {/* Account Tab */}
                {activeTab === 'account' && (
                    <div className="space-y-6">
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_8px_24px_rgba(17,24,39,0.08)] overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-purple-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-400/60 via-sky-400/40 to-transparent" />
                            <div className="relative px-6 py-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Account Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            value={user.firstName || ''}
                                            disabled
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={user.lastName || ''}
                                            disabled
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={user.email || ''}
                                            disabled
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Account Type</label>
                                        <input
                                            type="text"
                                            value={user.role || 'User'}
                                            disabled
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* GitHub Integration Tab */}
                {activeTab === 'github' && (
                    <div className="space-y-6">
                        {githubStatus?.hasToken ? (
                            <>
                                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_8px_24px_rgba(17,24,39,0.08)] overflow-hidden group">
                                    <div className="absolute inset-0 bg-linear-to-br from-green-50/50 via-emerald-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-green-400/60 via-emerald-400/40 to-transparent" />
                                    <div className="relative px-6 py-6">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-green-100/80">
                                                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.29 6.8 5.47 7.9.4.08.55-.18.55-.39 0-.2-.01-.73-.01-1.44-2.01.45-2.53-.9-2.69-1.3-.09-.23-.48-.94-.82-1.13-.28-.16-.68-.55-.01-.56.63-.01 1.08.6 1.23.85.72 1.25 1.87.9 2.33.69.07-.54.28-.9.51-1.11-1.78-.2-3.64-.92-3.64-4.09 0-.9.31-1.64.82-2.22-.08-.2-.36-1.03.08-2.15 0 0 .67-.22 2.2.85.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.07 2.2-.85 2.2-.85.44 1.12.16 1.95.08 2.15.51.58.82 1.32.82 2.22 0 3.18-1.87 3.88-3.65 4.08.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.47.55.39C13.71 15.13 16 12.01 16 8.33 16 3.73 12.42 0 8 0Z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">GitHub Connected</h3>
                                                    <p className="text-sm text-gray-600">Your GitHub account is authenticated</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                                                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-xs font-semibold text-green-700">Connected</span>
                                            </div>
                                        </div>

                                        {githubStatus?.github && (
                                            <div className="space-y-4 mb-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-900 mb-2">GitHub Username</label>
                                                    <input
                                                        type="text"
                                                        value={`@${githubStatus.github.username}`}
                                                        disabled
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
                                                    />
                                                </div>

                                                {githubStatus.github.name && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
                                                        <input
                                                            type="text"
                                                            value={githubStatus.github.name}
                                                            disabled
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
                                                        />
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Repository Access</label>
                                                    <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                                                        <p className="text-gray-700 font-medium">{githubStatus.github.access}</p>
                                                    </div>
                                                </div>

                                                {githubStatus.github.scopes && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Token Scopes</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {githubStatus.github.scopes.map((scope, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                                                                >
                                                                    {scope}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <button
                                            onClick={handleRemoveGithubToken}
                                            disabled={removingToken}
                                            className="px-6 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {removingToken ? 'Disconnecting...' : 'Disconnect GitHub'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_8px_24px_rgba(17,24,39,0.08)] overflow-hidden group">
                                <div className="absolute inset-0 bg-linear-to-br from-amber-50/50 via-orange-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber-400/60 via-orange-400/40 to-transparent" />
                                <div className="relative px-6 py-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-xl bg-amber-100/80">
                                            <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.29 6.8 5.47 7.9.4.08.55-.18.55-.39 0-.2-.01-.73-.01-1.44-2.01.45-2.53-.9-2.69-1.3-.09-.23-.48-.94-.82-1.13-.28-.16-.68-.55-.01-.56.63-.01 1.08.6 1.23.85.72 1.25 1.87.9 2.33.69.07-.54.28-.9.51-1.11-1.78-.2-3.64-.92-3.64-4.09 0-.9.31-1.64.82-2.22-.08-.2-.36-1.03.08-2.15 0 0 .67-.22 2.2.85.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.07 2.2-.85 2.2-.85.44 1.12.16 1.95.08 2.15.51.58.82 1.32.82 2.22 0 3.18-1.87 3.88-3.65 4.08.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.47.55.39C13.71 15.13 16 12.01 16 8.33 16 3.73 12.42 0 8 0Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">GitHub Not Connected</h3>
                                            <p className="text-sm text-gray-600">Connect your GitHub account to enable auto-redeploy</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-6">
                                        To use auto-redeploy with GitHub webhooks, you need to authenticate with GitHub. This will allow us to create and manage webhooks on your behalf.
                                    </p>

                                    <button
                                        onClick={handleGitHubOAuth}
                                        disabled={authorizingGitHub}
                                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        {authorizingGitHub ? (
                                            <>
                                                <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Redirecting to GitHub...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.29 6.8 5.47 7.9.4.08.55-.18.55-.39 0-.2-.01-.73-.01-1.44-2.01.45-2.53-.9-2.69-1.3-.09-.23-.48-.94-.82-1.13-.28-.16-.68-.55-.01-.56.63-.01 1.08.6 1.23.85.72 1.25 1.87.9 2.33.69.07-.54.28-.9.51-1.11-1.78-.2-3.64-.92-3.64-4.09 0-.9.31-1.64.82-2.22-.08-.2-.36-1.03.08-2.15 0 0 .67-.22 2.2.85.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.07 2.2-.85 2.2-.85.44 1.12.16 1.95.08 2.15.51.58.82 1.32.82 2.22 0 3.18-1.87 3.88-3.65 4.08.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.47.55.39C13.71 15.13 16 12.01 16 8.33 16 3.73 12.42 0 8 0Z" />
                                                </svg>
                                                Authenticate with GitHub
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile
