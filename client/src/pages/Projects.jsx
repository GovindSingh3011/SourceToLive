import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Projects() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [webhookLoading, setWebhookLoading] = useState({})
    const [deployLoading, setDeployLoading] = useState({})
    const [instructionModal, setInstructionModal] = useState(null)

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

    const toggleAutoRedeploy = async (projectId, currentStatus) => {
        const token = localStorage.getItem('token')
        if (!token) {
            alert('Please login to manage webhooks')
            return
        }

        setWebhookLoading(prev => ({ ...prev, [projectId]: true }))

        try {
            const endpoint = currentStatus ? 'disable' : 'enable'
            const response = await fetch(`${API_URL}/api/webhook/${endpoint}/${projectId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${endpoint} auto-redeploy`)
            }

            // Show webhook information if enabled
            if (!currentStatus && data.webhookUrls) {
                if (data.automaticSetup) {
                    setInstructionModal({
                        type: 'success',
                        title: '✅ Auto-redeploy Enabled!',
                        message: 'Webhook created automatically.',
                        webhookId: data.webhookId,
                        webhookSecret: data.webhookSecret,
                        webhookUrl: data.webhookUrls.github
                    })
                } else if (data.instructions?.message) {
                    setInstructionModal({
                        type: 'manual',
                        title: '📋 Manual Webhook Configuration',
                        message: data.instructions.message,
                        webhookSecret: data.webhookSecret,
                        webhookUrl: data.webhookUrls.github,
                        tokenUrl: data.instructions.tokenUrl
                    })
                } else {
                    setInstructionModal({
                        type: 'manual',
                        title: '⚙️ Webhook Configuration Required',
                        message: 'Auto-redeploy enabled! Please add this webhook to your GitHub repository manually.',
                        webhookSecret: data.webhookSecret,
                        webhookUrl: data.webhookUrls.github
                    })
                }
            } else if (currentStatus) {
                setInstructionModal({
                    type: 'info',
                    title: '✅ Auto-redeploy Disabled',
                    message: 'Webhook has been disabled and removed from GitHub.'
                })
            }

            // Refresh projects
            await fetchItems()
        } catch (err) {
            setInstructionModal({
                type: 'error',
                title: '❌ Error',
                message: err.message
            })
        } finally {
            setWebhookLoading(prev => ({ ...prev, [projectId]: false }))
        }
    }

    const triggerWebhook = async (projectId, gitUrl) => {
        if (!window.confirm('Trigger a manual deployment for this project?')) {
            return
        }

        setDeployLoading(prev => ({ ...prev, [projectId]: true }))

        try {
            const webhookPayload = {
                ref: 'refs/heads/main',
                repository: {
                    clone_url: gitUrl
                },
                head_commit: {
                    id: 'manual-trigger-' + Date.now(),
                    message: 'Manual deployment triggered'
                }
            }

            const response = await fetch(`${API_URL}/api/webhook/github/${projectId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(webhookPayload)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to trigger deployment')
            }

            alert('Deployment triggered successfully!\n\nTask ARN: ' + (data.taskArn || 'N/A'))
            await fetchItems()
        } catch (err) {
            alert('Error: ' + err.message)
        } finally {
            setDeployLoading(prev => ({ ...prev, [projectId]: false }))
        }
    }

    useEffect(() => {
        setLoading(true)
        fetchItems()
        const intervalId = setInterval(fetchItems, 3000)
        return () => clearInterval(intervalId)
    }, [])

    // Improved Instruction Modal Component
    const InstructionModal = () => {
        if (!instructionModal) return null

        const { type, title, message, webhookSecret, webhookUrl, webhookId } = instructionModal

        // Only close modal when button is clicked, not when clicking outside
        const handleClose = () => setInstructionModal(null)

        return (
            <>
                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px) scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                `}</style>

                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        backdrop: 'blur(8px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        padding: '20px',
                        animation: 'fadeIn 0.3s ease-out'
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '20px',
                            maxWidth: '850px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 30px 90px rgba(0, 0, 0, 0.5)',
                            animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Gradient Header */}
                        <div style={{
                            background: type === 'error'
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : type === 'success'
                                    ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '3rem 2.5rem',
                            borderRadius: '20px 20px 0 0',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative circles */}
                            <div style={{
                                position: 'absolute',
                                top: '-50px',
                                right: '-50px',
                                width: '200px',
                                height: '200px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%'
                            }}></div>
                            <div style={{
                                position: 'absolute',
                                bottom: '-30px',
                                left: '-30px',
                                width: '150px',
                                height: '150px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                borderRadius: '50%'
                            }}></div>

                            <h2 style={{
                                margin: 0,
                                fontSize: '2.2rem',
                                color: '#fff',
                                fontWeight: '800',
                                position: 'relative',
                                zIndex: 1,
                                letterSpacing: '-0.5px'
                            }}>{title}</h2>
                            <p style={{
                                fontSize: '1.1rem',
                                lineHeight: '1.6',
                                color: 'rgba(255, 255, 255, 0.95)',
                                margin: '1rem 0 0 0',
                                position: 'relative',
                                zIndex: 1
                            }}>{message}</p>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '2.5rem' }}>
                            {type === 'manual' && (
                                <>
                                    {/* Step 1 */}
                                    <div style={{ marginBottom: '3rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '1.5rem'
                                        }}>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: '#fff',
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '15px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                marginRight: '1.25rem',
                                                fontSize: '1.4rem',
                                                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
                                            }}>1</div>
                                            <h3 style={{
                                                margin: 0,
                                                color: '#1e293b',
                                                fontSize: '1.5rem',
                                                fontWeight: '700'
                                            }}>Open GitHub Repository Settings</h3>
                                        </div>
                                        <ol style={{
                                            margin: '0 0 0 5rem',
                                            paddingLeft: 0,
                                            lineHeight: '2.5',
                                            color: '#475569',
                                            fontSize: '1.05rem'
                                        }}>
                                            <li>Go to your GitHub repository</li>
                                            <li>Click <strong style={{ color: '#1e293b' }}>Settings</strong> (gear icon)</li>
                                            <li>Click <strong style={{ color: '#1e293b' }}>Webhooks</strong> in the left sidebar</li>
                                            <li>Click <strong style={{ color: '#1e293b' }}>Add webhook</strong> button</li>
                                        </ol>
                                    </div>

                                    {/* Step 2 */}
                                    <div style={{ marginBottom: '3rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '1.5rem'
                                        }}>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: '#fff',
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '15px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                marginRight: '1.25rem',
                                                fontSize: '1.4rem',
                                                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
                                            }}>2</div>
                                            <h3 style={{
                                                margin: 0,
                                                color: '#1e293b',
                                                fontSize: '1.5rem',
                                                fontWeight: '700'
                                            }}>Fill in Webhook Details</h3>
                                        </div>

                                        {/* Payload URL */}
                                        <div style={{
                                            marginLeft: '5rem',
                                            marginBottom: '1.75rem',
                                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                            padding: '1.75rem',
                                            borderRadius: '15px',
                                            border: '3px solid #e9ecef',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontWeight: '700',
                                                color: '#1e293b',
                                                marginBottom: '1rem',
                                                fontSize: '1.1rem'
                                            }}>
                                                <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>📤</span>
                                                Payload URL
                                            </label>
                                            <div style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                flexWrap: 'wrap'
                                            }}>
                                                <input
                                                    type="text"
                                                    value={webhookUrl || ''}
                                                    readOnly
                                                    style={{
                                                        flex: 1,
                                                        minWidth: '300px',
                                                        padding: '1.25rem',
                                                        fontFamily: '"Monaco", "Courier New", monospace',
                                                        fontSize: '0.95rem',
                                                        backgroundColor: '#fff',
                                                        border: '2px solid #cbd5e1',
                                                        borderRadius: '12px',
                                                        boxSizing: 'border-box',
                                                        wordBreak: 'break-all',
                                                        color: '#1e293b',
                                                        transition: 'all 0.2s'
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(webhookUrl)
                                                        const btn = event.target
                                                        const originalText = btn.textContent
                                                        btn.textContent = '✅ Copied!'
                                                        btn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                                                        setTimeout(() => {
                                                            btn.textContent = originalText
                                                            btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                        }, 2000)
                                                    }}
                                                    style={{
                                                        padding: '1.25rem 2rem',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        cursor: 'pointer',
                                                        fontSize: '1rem',
                                                        fontWeight: '700',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.3s',
                                                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.target.style.transform = 'translateY(-3px)'
                                                        e.target.style.boxShadow = '0 12px 28px rgba(102, 126, 234, 0.5)'
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.target.style.transform = 'translateY(0)'
                                                        e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
                                                    }}
                                                >
                                                    📋 Copy
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content Type */}
                                        <div style={{
                                            marginLeft: '5rem',
                                            marginBottom: '1.75rem',
                                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                            padding: '1.75rem',
                                            borderRadius: '15px',
                                            border: '3px solid #e9ecef',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontWeight: '700',
                                                color: '#1e293b',
                                                marginBottom: '1rem',
                                                fontSize: '1.1rem'
                                            }}>
                                                <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>📝</span>
                                                Content Type
                                            </label>
                                            <div style={{
                                                padding: '1.25rem',
                                                backgroundColor: '#fff',
                                                border: '3px solid #10b981',
                                                borderRadius: '12px',
                                                fontFamily: '"Monaco", "Courier New", monospace',
                                                color: '#059669',
                                                fontWeight: '700',
                                                fontSize: '1.05rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem'
                                            }}>
                                                <span style={{ color: '#10b981', fontSize: '1.4rem' }}>✓</span>
                                                application/json
                                            </div>
                                        </div>

                                        {/* Secret */}
                                        <div style={{
                                            marginLeft: '5rem',
                                            marginBottom: '1.75rem',
                                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                            padding: '1.75rem',
                                            borderRadius: '15px',
                                            border: '3px solid #e9ecef',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontWeight: '700',
                                                color: '#1e293b',
                                                marginBottom: '1rem',
                                                fontSize: '1.1rem'
                                            }}>
                                                <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>🔐</span>
                                                Secret
                                            </label>
                                            <div style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                flexWrap: 'wrap'
                                            }}>
                                                <input
                                                    type="text"
                                                    value={webhookSecret || ''}
                                                    readOnly
                                                    style={{
                                                        flex: 1,
                                                        minWidth: '300px',
                                                        padding: '1.25rem',
                                                        fontFamily: '"Monaco", "Courier New", monospace',
                                                        fontSize: '0.95rem',
                                                        backgroundColor: '#fff',
                                                        border: '2px solid #cbd5e1',
                                                        borderRadius: '12px',
                                                        boxSizing: 'border-box',
                                                        wordBreak: 'break-all',
                                                        color: '#1e293b',
                                                        transition: 'all 0.2s'
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(webhookSecret)
                                                        const btn = event.target
                                                        const originalText = btn.textContent
                                                        btn.textContent = '✅ Copied!'
                                                        btn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                                                        setTimeout(() => {
                                                            btn.textContent = originalText
                                                            btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                        }, 2000)
                                                    }}
                                                    style={{
                                                        padding: '1.25rem 2rem',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        cursor: 'pointer',
                                                        fontSize: '1rem',
                                                        fontWeight: '700',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.3s',
                                                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.target.style.transform = 'translateY(-3px)'
                                                        e.target.style.boxShadow = '0 12px 28px rgba(102, 126, 234, 0.5)'
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.target.style.transform = 'translateY(0)'
                                                        e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
                                                    }}
                                                >
                                                    📋 Copy
                                                </button>
                                            </div>
                                        </div>

                                        {/* Events */}
                                        <div style={{
                                            marginLeft: '5rem',
                                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                            padding: '1.75rem',
                                            borderRadius: '15px',
                                            border: '3px solid #e9ecef',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontWeight: '700',
                                                color: '#1e293b',
                                                marginBottom: '1rem',
                                                fontSize: '1.1rem'
                                            }}>
                                                <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>📌</span>
                                                Which events to trigger this webhook?
                                            </label>
                                            <div style={{
                                                padding: '1.25rem',
                                                backgroundColor: '#fff',
                                                border: '3px solid #10b981',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                fontSize: '1.05rem',
                                                fontWeight: '700',
                                                color: '#059669'
                                            }}>
                                                <span style={{ color: '#10b981', fontSize: '1.4rem' }}>☑️</span>
                                                Push events
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div style={{ marginBottom: '3rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '1.5rem'
                                        }}>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: '#fff',
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '15px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                marginRight: '1.25rem',
                                                fontSize: '1.4rem',
                                                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
                                            }}>3</div>
                                            <h3 style={{
                                                margin: 0,
                                                color: '#1e293b',
                                                fontSize: '1.5rem',
                                                fontWeight: '700'
                                            }}>Complete Setup</h3>
                                        </div>
                                        <ol style={{
                                            margin: '0 0 0 5rem',
                                            paddingLeft: 0,
                                            lineHeight: '2.5',
                                            color: '#475569',
                                            fontSize: '1.05rem'
                                        }}>
                                            <li>Make sure <strong style={{ color: '#1e293b' }}>"Active"</strong> is checked</li>
                                            <li>Click <strong style={{ color: '#1e293b' }}>Add webhook</strong> button</li>
                                            <li>GitHub will test the webhook</li>
                                            <li>Done! <span style={{ fontSize: '1.3rem' }}>🎉</span> Auto-deploy is now active</li>
                                        </ol>
                                    </div>

                                    {/* Success Banner */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                        borderRadius: '15px',
                                        padding: '2.25rem',
                                        color: '#fff',
                                        lineHeight: '1.9',
                                        boxShadow: '0 8px 25px rgba(17, 153, 142, 0.4)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '-40px',
                                            right: '-40px',
                                            width: '120px',
                                            height: '120px',
                                            background: 'rgba(255, 255, 255, 0.15)',
                                            borderRadius: '50%'
                                        }}></div>
                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <strong style={{
                                                fontSize: '1.3rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                marginBottom: '1rem'
                                            }}>
                                                <span style={{ fontSize: '1.8rem' }}>✅</span>
                                                Next Steps
                                            </strong>
                                            <p style={{
                                                margin: 0,
                                                opacity: 0.97,
                                                fontSize: '1.1rem',
                                                lineHeight: '1.8'
                                            }}>
                                                After adding this webhook, every time you push code to your repository, GitHub will automatically trigger a deployment!
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {type === 'success' && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                    borderRadius: '15px',
                                    padding: '2.5rem',
                                    color: '#fff',
                                    boxShadow: '0 8px 25px rgba(17, 153, 142, 0.4)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-50px',
                                        right: '-50px',
                                        width: '150px',
                                        height: '150px',
                                        background: 'rgba(255, 255, 255, 0.12)',
                                        borderRadius: '50%'
                                    }}></div>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{
                                            fontSize: '4rem',
                                            marginBottom: '1rem',
                                            textAlign: 'center'
                                        }}>✅</div>
                                        <p style={{
                                            margin: '0 0 2rem 0',
                                            fontSize: '1.5rem',
                                            fontWeight: '800',
                                            textAlign: 'center'
                                        }}>
                                            Webhook Created Successfully!
                                        </p>
                                        <div style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.97)',
                                            borderRadius: '12px',
                                            padding: '1.75rem',
                                            fontFamily: 'monospace',
                                            fontSize: '1rem',
                                            marginBottom: '2rem',
                                            wordBreak: 'break-all',
                                            color: '#1e293b',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
                                        }}>
                                            <strong>Webhook ID:</strong><br />
                                            <span style={{
                                                color: '#059669',
                                                fontWeight: '700',
                                                fontSize: '1.1rem'
                                            }}>{webhookId}</span>
                                        </div>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '1.15rem',
                                            opacity: 0.97,
                                            textAlign: 'center',
                                            lineHeight: '1.7'
                                        }}>
                                            🎉 Webhook has been created automatically on GitHub.<br />
                                            Auto-deploy is ready to use!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {type === 'info' && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                    borderRadius: '15px',
                                    padding: '3rem',
                                    color: '#fff',
                                    fontSize: '1.2rem',
                                    fontWeight: '600',
                                    boxShadow: '0 8px 25px rgba(17, 153, 142, 0.4)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✅</div>
                                    {message}
                                </div>
                            )}

                            {type === 'error' && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    borderRadius: '15px',
                                    padding: '3rem',
                                    color: '#fff',
                                    fontSize: '1.2rem',
                                    fontWeight: '600',
                                    boxShadow: '0 8px 25px rgba(245, 87, 108, 0.4)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>❌</div>
                                    {message}
                                </div>
                            )}
                        </div>

                        {/* Footer with Close Button */}
                        <div style={{
                            padding: '2.5rem',
                            borderTop: '3px solid #f1f3f5',
                            display: 'flex',
                            justifyContent: 'center',
                            backgroundColor: '#fafbfc',
                            borderRadius: '0 0 20px 20px'
                        }}>
                            <button
                                onClick={handleClose}
                                style={{
                                    padding: '1.25rem 4rem',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '15px',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    fontWeight: '800',
                                    transition: 'all 0.3s',
                                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                                    letterSpacing: '0.5px'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = 'translateY(-4px) scale(1.02)'
                                    e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.5)'
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = 'translateY(0) scale(1)'
                                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'
                                }}
                            >
                                OK, Got it! 👍
                            </button>
                        </div>
                    </div>
                </div>
            </>
        )
    }

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
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1', minWidth: '250px' }}>
                                        <div><strong>{p.projectId}</strong></div>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>{p.gitRepositoryUrl}</div>
                                        {p.deployUrl && (
                                            <div style={{ fontSize: '0.9rem' }}>
                                                <strong>Deploy:</strong> <a href={p.deployUrl} target="_blank" rel="noopener noreferrer">{p.deployUrl}</a>
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                            <strong>Auto-deploy:</strong> {p.autoRedeploy ?
                                                <span style={{ color: '#28a745' }}>✓ Enabled</span> :
                                                <span style={{ color: '#dc3545' }}>✗ Disabled</span>
                                            }
                                        </div>
                                    </div>
                                    <div style={{ textTransform: 'capitalize' }}>
                                        Status: {p.status}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={() => triggerWebhook(p.projectId, p.gitRepositoryUrl)}
                                            disabled={deployLoading[p.projectId] || p.status === 'running'}
                                            className="publish-btn"
                                            style={{
                                                backgroundColor: '#0366d6',
                                                minWidth: '100px'
                                            }}
                                        >
                                            {deployLoading[p.projectId] ? 'Triggering...' : '🚀 Deploy'}
                                        </button>
                                        <button
                                            onClick={() => toggleAutoRedeploy(p.projectId, p.autoRedeploy)}
                                            disabled={webhookLoading[p.projectId]}
                                            className="publish-btn"
                                            style={{
                                                backgroundColor: p.autoRedeploy ? '#ffc107' : '#28a745',
                                                minWidth: '120px'
                                            }}
                                        >
                                            {webhookLoading[p.projectId] ? 'Loading...' :
                                                p.autoRedeploy ? 'Disable Auto-deploy' : 'Enable Auto-deploy'}
                                        </button>
                                        <Link className="publish-btn" to={`/projects/${encodeURIComponent(p.projectId)}`}>View</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <InstructionModal />
        </div>
    )
}

export default Projects
