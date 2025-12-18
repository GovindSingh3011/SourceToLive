import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Projects() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchItems = async () => {
        setError('')
        try {
            const res = await fetch(`${API_URL}/api/project`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to load projects')
            setItems(data.items || [])
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setLoading(true)
        fetchItems()
        const intervalId = setInterval(fetchItems, 3000)
        return () => clearInterval(intervalId)
    }, [])

    return (
        <div className="app-container">
            <div className="header">
                <h1>Projects</h1>
                <Link className="login-btn" to="/">← Back</Link>
            </div>

            {error && <div className="error-message">{error}</div>}
            {loading && <div>Loading...</div>}

            {!loading && (
                <div className="logs-container">
                    <div className="logs">
                        {items.length === 0 && <div>No projects yet.</div>}
                        {items.map((p) => (
                            <div key={p._id} className="log-entry">
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <div>
                                        <div><strong>{p.projectId}</strong></div>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>{p.gitRepositoryUrl}</div>
                                        {p.deployUrl && (
                                            <div style={{ fontSize: '0.9rem' }}>
                                                <strong>Deploy:</strong> <a href={p.deployUrl} target="_blank" rel="noopener noreferrer">{p.deployUrl}</a>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ textTransform: 'capitalize' }}>
                                        Status: {p.status}
                                    </div>
                                    <div>
                                        <Link className="publish-btn" to={`/projects/${encodeURIComponent(p.projectId)}`}>View</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Projects
