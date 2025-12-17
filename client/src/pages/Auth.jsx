import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import './Auth.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '49618724625-fse5sagvoien4htgd2evjsq300sjvigk.apps.googleusercontent.com'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Debug: Log the Google Client ID
console.log('🔍 Google Client ID:', GOOGLE_CLIENT_ID)
console.log('🔍 API URL:', API_URL)

function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login', 'register', 'verify'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    otp: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  // Handle Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setSuccess('Login successful! Redirecting...')
      setTimeout(() => navigate('/'), 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      setPendingEmail(formData.email)
      setMode('verify')
      setSuccess('OTP sent to your email! Please check and verify.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP Verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingEmail,
          otp: formData.otp,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed')
      }

      setSuccess('Registration successful! You can now log in.')
      // Reset form and go to login
      setFormData({ email: '', password: '', firstName: '', lastName: '', otp: '' })
      setMode('login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Google OAuth
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialResponse.credential
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Google login failed')
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setSuccess('Google login successful! Redirecting...')
      setTimeout(() => navigate('/'), 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.')
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="auth-container">
        <div className="auth-card">
          <h1>Source to Live</h1>
          <p className="auth-subtitle">Deploy your projects in seconds</p>

          {/* Tab Navigation */}
          {mode !== 'verify' && (
            <div className="auth-tabs">
              <button
                className={`tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setMode('login')
                  setError('')
                  setSuccess('')
                }}
              >
                Login
              </button>
              <button
                className={`tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setMode('register')
                  setError('')
                  setSuccess('')
                }}
              >
                Register
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="auth-divider">
                <span>OR</span>
              </div>

              <div className="google-btn-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  size="large"
                  text="signin_with"
                />
              </div>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Register'}
              </button>

              <div className="auth-divider">
                <span>OR</span>
              </div>

              <div className="google-btn-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  size="large"
                  text="signup_with"
                />
              </div>
            </form>
          )}

          {/* OTP Verification Form */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="verify-info">
                <p>We've sent a verification code to:</p>
                <p className="verify-email">{pendingEmail}</p>
              </div>

              <div className="form-group">
                <label htmlFor="otp">Verification Code</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                  disabled={loading}
                  className="otp-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Set Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <small>Minimum 6 characters</small>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
              </button>

              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  setMode('register')
                  setFormData({ ...formData, otp: '' })
                  setError('')
                }}
                disabled={loading}
              >
                Back to Registration
              </button>
            </form>
          )}

          {/* Back to Home Link */}
          <div className="auth-footer">
            <button
              onClick={() => navigate('/')}
              className="link-btn"
              disabled={loading}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

export default Auth
