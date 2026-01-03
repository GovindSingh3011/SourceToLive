import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Settings() {
    const navigate = useNavigate()
    const [tokenStatus, setTokenStatus] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        checkTokenStatus()

        // Check for OAuth callback params
        const params = new URLSearchParams(window.location.search)
        const oauthError = params.get('error')
        const oauthSuccess = params.get('success')
        const username = params.get('username')

        if (oauthError) {
            setError(decodeURIComponent(oauthError))
            // Clean URL
            window.history.replaceState({}, '', '/settings')
        }

        if (oauthSuccess) {
            setSuccess(username ? `${oauthSuccess} (${username})` : oauthSuccess)
            checkTokenStatus() // Refresh status
            // Clean URL
            window.history.replaceState({}, '', '/settings')
        }
    }, [])

    const checkTokenStatus = async () => {
        const authToken = localStorage.getItem('token')
        if (!authToken) {
            navigate('/auth')
            return
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/github-token/status`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })

            const data = await response.json()
            if (response.ok) {
                setTokenStatus(data)
            }
        } catch (err) {
            console.error('Failed to check token status:', err)
        }
    }

    const handleConnectGitHub = async () => {
        const authToken = localStorage.getItem('token')
        if (!authToken) {
            setError('Please login first')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${API_URL}/api/auth/github/oauth`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to initiate GitHub OAuth')
            }

            // Redirect to GitHub OAuth
            window.location.href = data.authUrl

        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    const handleRemoveToken = async () => {
        if (!window.confirm('Are you sure you want to remove your GitHub account connection?')) {
            return
        }

        const authToken = localStorage.getItem('token')
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch(`${API_URL}/api/auth/github-token`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to remove token')
            }

            setSuccess('GitHub account disconnected successfully!')
            setTokenStatus(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app-container">
            <div className="header">
                <h1>GitHub Token Settings</h1>
                <Link className="login-btn" to="/">← Back to Home</Link>
            </div>

            <div className="auth-container">
                <div className="auth-form">
                    <h2>Connect GitHub Account</h2>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        Connect your GitHub account to enable automatic webhook creation for auto-deploy features.
                    </p>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message" style={{
                        padding: '0.75rem',
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        borderRadius: '4px',
                        marginBottom: '1rem'
                    }}>{success}</div>}

                    {tokenStatus?.hasToken && tokenStatus?.isValid ? (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                padding: '1rem',
                                backgroundColor: '#d4edda',
                                borderRadius: '4px',
                                marginBottom: '1rem'
                            }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#155724' }}>✓ GitHub Connected</h3>
                                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#155724' }}>
                                    <strong>Username:</strong> {tokenStatus.github?.username}
                                </p>
                                {tokenStatus.github?.name && (
                                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#155724' }}>
                                        <strong>Name:</strong> {tokenStatus.github.name}
                                    </p>
                                )}
                                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#155724' }}>
                                    <strong>Access Level:</strong> {tokenStatus.github?.access}
                                </p>
                            </div>
                            <button
                                onClick={handleRemoveToken}
                                disabled={loading}
                                className="submit-btn"
                                style={{ backgroundColor: '#dc3545' }}
                            >
                                {loading ? 'Disconnecting...' : 'Disconnect GitHub'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                padding: '1rem',
                                backgroundColor: '#e7f3ff',
                                borderRadius: '4px',
                                marginBottom: '1.5rem',
                                fontSize: '0.9rem'
                            }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0c5460' }}>What permissions do we request?</h3>
                                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', color: '#0c5460' }}>
                                    <li><strong>repo</strong> - Access to all repositories</li>
                                    <li><strong>admin:repo_hook</strong> - Read and write access to repository webhooks</li>
                                </ul>
                                <p style={{ margin: '0.5rem 0 0 0', color: '#0c5460' }}>
                                    These permissions allow us to automatically create webhooks for your projects.
                                </p>
                            </div>

                            <button
                                onClick={handleConnectGitHub}
                                disabled={loading}
                                className="submit-btn"
                                style={{
                                    backgroundColor: '#24292e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                                </svg>
                                {loading ? 'Connecting...' : 'Connect GitHub Account'}
                            </button>

                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                color: '#6c757d'
                            }}>
                                <h4 style={{ margin: '0 0 0.5rem 0' }}>How does this work?</h4>
                                <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                                    <li>Click "Connect GitHub Account" button above</li>
                                    <li>You'll be redirected to GitHub to authorize this application</li>
                                    <li>Review the requested permissions and click "Authorize"</li>
                                    <li>You'll be automatically redirected back here</li>
                                    <li>Your account is now connected and ready to use!</li>
                                </ol>
                                <p style={{ margin: '0.5rem 0 0 0' }}>
                                    <strong>Security Note:</strong> We only use your authorization to create webhooks in your repositories. Your token is encrypted and never shared.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings
