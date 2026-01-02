import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Project() {
    const { projectId } = useParams()
    const [item, setItem] = useState(null)
    const [logs, setLogs] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState('live') // 'live' | 'archive'
    const [isStreaming, setIsStreaming] = useState(false)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError('')
            try {
                const res = await fetch(`${API_URL}/api/project/${encodeURIComponent(projectId)}`)
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to fetch project')
                setItem(data.item)
                // Decide default view based on status
                if (data.item && (data.item.status === 'finished' || data.item.status === 'failed')) {
                    setView('archive')
                } else {
                    setView('live')
                }
            } catch (e) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [projectId])

    // Poll for status changes and update UI automatically
    useEffect(() => {
        let active = true
        const poll = async () => {
            try {
                const res = await fetch(`${API_URL}/api/project/${encodeURIComponent(projectId)}`)
                const data = await res.json()
                if (!res.ok || !active) return
                if (data.item) {
                    setItem(data.item)
                    const nextView = (data.item.status === 'finished' || data.item.status === 'failed') ? 'archive' : 'live'
                    setView(nextView)
                }
            } catch (_) { /* ignore */ }
        }
        const intervalId = setInterval(poll, 3000)
        return () => { active = false; clearInterval(intervalId) }
    }, [projectId])

    useEffect(() => {
        if (view !== 'live') return
        setIsStreaming(true)
        const es = new EventSource(`${API_URL}/api/project/${encodeURIComponent(projectId)}/logs/stream`)
        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                const ts = typeof data.ts === 'number' ? data.ts : Date.now()
                if (data.status === 'finished') {
                    setLogs(prev => [{ ts, message: '✓ Finished' }, ...prev])
                    es.close()
                    setIsStreaming(false)
                    // Switch to archived logs when finished
                    setView('archive')
                } else if (data.status === 'failed') {
                    setLogs(prev => [{ ts, message: '✗ Failed' }, ...prev])
                    es.close()
                    setIsStreaming(false)
                    // Switch to archived logs when failed
                    setView('archive')
                } else if (data.status === 'error') {
                    setLogs(prev => [{ ts, message: `✗ Error: ${data.message}` }, ...prev])
                    es.close()
                    setIsStreaming(false)
                } else {
                    const msg = data.message || data.status || JSON.stringify(data)
                    setLogs(prev => [{ ts, message: msg }, ...prev])
                }
            } catch (e) {
                setLogs(prev => [{ ts: Date.now(), message: '✗ Failed to parse log event' }, ...prev])
            }
        }
        es.onerror = () => {
            es.close()
            setIsStreaming(false)
        }
        return () => {
            es.close()
            setIsStreaming(false)
        }
    }, [projectId, view])

    const loadArchived = async () => {
        setError('')
        try {
            const res = await fetch(`${API_URL}/api/project/${encodeURIComponent(projectId)}/logs/archive`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to load archived logs')
            const items = (data.items || []).map(it => ({ ts: typeof it.ts === 'number' ? it.ts : Date.now(), message: it.message || JSON.stringify(it) }))
            setLogs(items.reverse())
        } catch (e) {
            setError(e.message)
        }
    }

    // Load archived automatically when view switches; clear logs on switching to live
    useEffect(() => {
        if (view === 'archive') {
            loadArchived()
        } else if (view === 'live') {
            setLogs([])
        }
    }, [view, projectId])

    return (
        <div className="app-container">
            <div className="header">
                <h1>Project Detail</h1>
                <Link className="login-btn" to="/projects">← Back</Link>
            </div>

            {error && <div className="error-message">{error}</div>}
            {loading && <div>Loading...</div>}

            {item && (
                <div className="form-container">
                    <div className="input-group">
                        <label>Project ID</label>
                        <input type="text" value={item.projectId} disabled />
                    </div>
                    <div className="input-group">
                        <label>Git URL</label>
                        <input type="text" value={item.gitRepositoryUrl} disabled />
                    </div>
                    <div className="input-group">
                        <label>Status</label>
                        <input type="text" value={item.status} disabled />
                    </div>
                    {item.deployUrl && (
                        <div className="deployment-url">
                            <strong>Deployment URL:</strong> <a href={item.deployUrl} target="_blank" rel="noopener noreferrer">{item.deployUrl}</a>
                        </div>
                    )}
                    <div className="input-group">
                        <label>Logs</label>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            {view === 'live' ? (isStreaming ? 'Streaming live logs…' : 'Stream idle') : 'Showing archived logs'}
                        </div>
                    </div>
                </div>
            )}

            <div className="logs-container">
                <h2>{view === 'live' ? 'Live Logs' : 'Archived Logs'}</h2>
                <div className="logs">
                    {logs.length === 0 && <div>No logs yet.</div>}
                    {logs.map((log, idx) => (
                        <div key={idx} className="log-entry">
                            <span className="log-timestamp">{new Date(log.ts).toLocaleTimeString()}</span>
                            <span className="log-message">{log.message}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Project
