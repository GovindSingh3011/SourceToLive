import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Home() {
  const navigate = useNavigate()
  const [gitUrl, setGitUrl] = useState('')
  const [projectId, setProjectId] = useState('')
  const [installCmd, setInstallCmd] = useState('npm install')
  const [buildCmd, setBuildCmd] = useState('npm run build')
  const [buildRoot, setBuildRoot] = useState('')
  const [logs, setLogs] = useState([])
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentUrl, setDeploymentUrl] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const handlePublish = async () => {
    if (!gitUrl || !projectId) {
      setError('Both GitHub URL and Project ID are required')
      return
    }

    setError('')
    setLogs([])
    setDeploymentUrl('')
    setIsDeploying(true)

    try {
      // POST to /api/project
      const headers = {
        'Content-Type': 'application/json',
      }

      // Add auth token if user is logged in
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_URL}/api/project`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          GIT_REPOSITORY__URL: gitUrl,
          PROJECT_ID: projectId,
          INSTALL_CMD: installCmd,
          BUILD_CMD: buildCmd,
          BUILD_ROOT: buildRoot,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create project')
      }

      const data = await response.json()
      setDeploymentUrl(data.data?.url || '')
      setLogs(prev => [{ ts: Date.now(), message: `✓ Project queued successfully. Task ARN: ${data.data?.taskArn}` }, ...prev])

      // Start streaming logs
      streamLogs(projectId)
    } catch (err) {
      setError(err.message)
      setIsDeploying(false)
    }
  }

  const streamLogs = (projectId) => {
    const eventSource = new EventSource(`${API_URL}/api/project/${projectId}/logs/stream`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.status === 'finished') {
          setLogs(prev => [{ ts: Date.now(), message: '✓ Deployment completed!' }, ...prev])
          eventSource.close()
          setIsDeploying(false)
        } else if (data.status === 'error') {
          setLogs(prev => [{ ts: Date.now(), message: `✗ Error: ${data.message}` }, ...prev])
          eventSource.close()
          setIsDeploying(false)
        } else if (data.message) {
          setLogs(prev => [data, ...prev])
        }
      } catch (err) {
        console.error('Error parsing log event:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('EventSource error:', err)
      eventSource.close()
      setIsDeploying(false)
    }
  }

  return (
    <div className="app-container">
      {/* Header with Auth */}
      <div className="header">
        <h1>Source to Live - Deployment</h1>
        <div className="auth-section" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={() => navigate('/projects')} className="login-btn" rel="noopener noreferrer" target="_blank">
            View Projects
          </button>
          {user ? (
            <div className="user-info" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="welcome">Welcome, {user.username || user.email}!</span>
              <button onClick={() => navigate('/settings')} className="login-btn">
                Settings
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/auth')} className="login-btn">
              Login / Register
            </button>
          )}
        </div>
      </div>

      <div className="form-container">
        <div className="input-group">
          <label htmlFor="gitUrl">GitHub Repository URL</label>
          <input
            id="gitUrl"
            type="text"
            value={gitUrl}
            onChange={(e) => setGitUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            disabled={isDeploying}
          />
        </div>

        <div className="input-group">
          <label htmlFor="projectId">Project ID</label>
          <input
            id="projectId"
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="my-project-123"
            disabled={isDeploying}
          />
        </div>

        <div className="input-group">
          <label htmlFor="installCmd">Install Command</label>
          <input
            id="installCmd"
            type="text"
            value={installCmd}
            onChange={(e) => setInstallCmd(e.target.value)}
            placeholder="npm install"
            disabled={isDeploying}
          />
        </div>

        <div className="input-group">
          <label htmlFor="buildCmd">Build Command</label>
          <input
            id="buildCmd"
            type="text"
            value={buildCmd}
            onChange={(e) => setBuildCmd(e.target.value)}
            placeholder="npm run build"
            disabled={isDeploying}
          />
        </div>

        <div className="input-group">
          <label htmlFor="buildRoot">Build Root (Optional)</label>
          <input
            id="buildRoot"
            type="text"
            value={buildRoot}
            onChange={(e) => setBuildRoot(e.target.value)}
            placeholder="e.g., client/ or packages/web"
            disabled={isDeploying}
          />
        </div>

        <button
          onClick={handlePublish}
          disabled={isDeploying}
          className="publish-btn"
        >
          {isDeploying ? 'Deploying...' : 'Publish'}
        </button>

        {error && <div className="error-message">{error}</div>}

        {deploymentUrl && (
          <div className="deployment-url">
            <strong>Deployment URL:</strong> <a href={deploymentUrl} target="_blank" rel="noopener noreferrer">{deploymentUrl}</a>
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="logs-container">
          <h2>Deployment Logs</h2>
          <div className="logs">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-timestamp">
                  {new Date(log.ts).toLocaleTimeString()}
                </span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
