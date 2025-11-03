import { useState } from 'react'
import './App.css'

function App() {
  const [gitUrl, setGitUrl] = useState('')
  const [projectId, setProjectId] = useState('')
  const [logs, setLogs] = useState([])
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentUrl, setDeploymentUrl] = useState('')
  const [error, setError] = useState('')

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
      const response = await fetch('http://localhost:3000/api/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          GIT_REPOSITORY__URL: gitUrl,
          PROJECT_ID: projectId,
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
    const eventSource = new EventSource(`http://localhost:3000/api/project/${projectId}/logs/stream`)

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
      <h1>Source to Live - Deployment</h1>

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

export default App
