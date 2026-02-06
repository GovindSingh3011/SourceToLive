import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function ProjectSettings() {
    const navigate = useNavigate()
    const { projectId } = useParams()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState(null)
    const [showGitHubAuthModal, setShowGitHubAuthModal] = useState(false)
    const [editingField, setEditingField] = useState(null) // Track which field is being edited
    const [originalFormData, setOriginalFormData] = useState(null) // Store original values
    const [showDeleteModal, setShowDeleteModal] = useState(false) // Delete confirmation modal
    const [deleteProjectNameInput, setDeleteProjectNameInput] = useState('') // Project name confirmation
    const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('') // 'delete my project' confirmation

    // Form states
    const [formData, setFormData] = useState({
        projectName: '',
        gitRepositoryUrl: '',
        buildCommand: '',
        installCommand: '',
        rootDirectory: '',
        autoRedeploy: false,
    })

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }

        fetchProjectDetail(token)
    }, [projectId, navigate])

    const fetchProjectDetail = async (token) => {
        try {
            setLoading(true)
            const response = await fetch(`${apiUrl}/api/project/${projectId}`, {
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
                throw new Error('Failed to fetch project details')
            }

            const data = await response.json()
            setProject(data)
            const initialData = {
                projectName: data.projectId || '',
                gitRepositoryUrl: data.gitRepositoryUrl || '',
                buildCommand: data.buildConfig?.buildCmd || '',
                installCommand: data.buildConfig?.installCmd || '',
                rootDirectory: data.buildConfig?.buildRoot || '',
                autoRedeploy: data.autoRedeploy || false,
            }
            setFormData(initialData)
            setOriginalFormData(initialData) // Store original values
            setError(null)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching project:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        // Mark this field as being edited
        if (type !== 'checkbox') {
            setEditingField(name)
        }
    }

    const handleSaveField = async (fieldName) => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }

        try {
            setIsSaving(true)

            // Prepare the update payload based on field name
            let updatePayload = {
                [fieldName]: formData[fieldName],
            }

            // Map frontend field names to backend expectations
            if (fieldName === 'buildCommand') {
                updatePayload = { buildCommand: formData.buildCommand }
            } else if (fieldName === 'installCommand') {
                updatePayload = { installCommand: formData.installCommand }
            } else if (fieldName === 'rootDirectory') {
                updatePayload = { rootDirectory: formData.rootDirectory }
            }

            const response = await fetch(`${apiUrl}/api/project/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatePayload)
            })

            if (!response.ok) {
                throw new Error('Failed to save settings')
            }

            // Update original values
            setOriginalFormData(prev => ({
                ...prev,
                [fieldName]: formData[fieldName]
            }))

            setSaveMessage({ type: 'success', text: 'Saved successfully!' })
            setEditingField(null) // Clear editing state
            setTimeout(() => setSaveMessage(null), 3000)
        } catch (err) {
            setSaveMessage({ type: 'error', text: err.message })
            console.error('Error saving settings:', err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancelEdit = (fieldName) => {
        // Revert to original value
        setFormData(prev => ({
            ...prev,
            [fieldName]: originalFormData[fieldName]
        }))
        setEditingField(null) // Clear editing state
        setSaveMessage(null)
    }

    const handleAutoRedeployChange = async (e) => {
        const checked = !formData.autoRedeploy
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }

        // If toggling ON, setup webhook
        if (checked) {
            try {
                setIsSaving(true)
                const response = await fetch(`${apiUrl}/api/project/${projectId}/webhook/setup`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (!response.ok) {
                    let errorMessage = 'Failed to setup webhook'
                    try {
                        const error = await response.json()
                        errorMessage = error.message || error.error || errorMessage
                    } catch (parseErr) {
                        errorMessage = `Server error: ${response.status} ${response.statusText}`
                    }
                    throw new Error(errorMessage)
                }

                const result = await response.json()
                setFormData(prev => ({
                    ...prev,
                    autoRedeploy: true
                }))
                setSaveMessage({ type: 'success', text: 'Webhook created and auto-redeploy enabled!' })
                setTimeout(() => setSaveMessage(null), 3000)
            } catch (err) {
                // Check if error is due to missing GitHub token
                if (err.message.includes('access token') || err.message.includes('GitHub')) {
                    setShowGitHubAuthModal(true)
                } else {
                    setSaveMessage({ type: 'error', text: `Webhook setup failed: ${err.message}` })
                }
                console.error('Error setting up webhook:', err)
                // Don't update formData if webhook setup failed
            } finally {
                setIsSaving(false)
            }
        } else {
            // If toggling OFF, delete webhook from GitHub
            try {
                setIsSaving(true)
                const response = await fetch(`${apiUrl}/api/project/${projectId}/webhook/delete`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (!response.ok) {
                    let errorMessage = 'Failed to delete webhook'
                    try {
                        const error = await response.json()
                        errorMessage = error.message || error.error || errorMessage
                    } catch (parseErr) {
                        errorMessage = `Server error: ${response.status} ${response.statusText}`
                    }
                    throw new Error(errorMessage)
                }

                setFormData(prev => ({
                    ...prev,
                    autoRedeploy: false
                }))
                setSaveMessage({ type: 'success', text: 'Webhook removed and auto-redeploy disabled!' })
                setTimeout(() => setSaveMessage(null), 3000)
            } catch (err) {
                setSaveMessage({ type: 'error', text: `Webhook deletion failed: ${err.message}` })
                console.error('Error deleting webhook:', err)
                // Don't update formData if webhook deletion failed
            } finally {
                setIsSaving(false)
            }
        }
    }

    const handleGitHubAuthClick = () => {
        // You can customize the GitHub OAuth URL or direct to settings
        setShowGitHubAuthModal(false)
        // Navigate to profile settings where user can add GitHub token
        navigate('/profile')
    }

    const handleDeleteProject = () => {
        setShowDeleteModal(true)
        setDeleteProjectNameInput('')
        setDeleteConfirmationInput('')
    }

    const handleConfirmDelete = async () => {
        if (deleteProjectNameInput !== formData.projectName) {
            setSaveMessage({ type: 'error', text: `Project name does not match` })
            return
        }

        if (deleteConfirmationInput !== 'delete my project') {
            setSaveMessage({ type: 'error', text: 'Confirmation phrase does not match' })
            return
        }

        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }

        try {
            setIsSaving(true)
            const response = await fetch(`${apiUrl}/api/project/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to delete project')
            }

            setShowDeleteModal(false)
            setDeleteProjectNameInput('')
            setDeleteConfirmationInput('')
            navigate('/dashboard')
        } catch (err) {
            setSaveMessage({ type: 'error', text: `Deleting ${formData.projectName} cannot be undone.` })
            console.error('Error deleting project:', err)
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading settings...</p>
                </div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl p-8 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Settings</h2>
                    <p className="text-gray-600 mb-6">{error || 'Project not found'}</p>
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
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => navigate(`/project/${projectId}`)}
                            className="w-fit text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Project
                        </button>
                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight pb-1 bg-linear-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                            Project Settings
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Configure your project settings and deployment options
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {saveMessage && (
                    <div className={`mb-6 p-4 rounded-lg border ${saveMessage.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        {saveMessage.text}
                    </div>
                )}

                <div className="space-y-6">
                    {/* General Settings */}
                    <div id="general" className="space-y-6">
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_8px_24px_rgba(17,24,39,0.08)] overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-purple-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-400/60 via-sky-400/40 to-transparent" />
                            <div className="relative px-6 py-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-xl bg-blue-100/80">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">General Settings</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Project Name</label>
                                        <input
                                            type="text"
                                            name="projectName"
                                            value={formData.projectName}
                                            disabled
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Project name cannot be changed</p>
                                    </div>

                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                                            <div className="flex-1">
                                                <label className="block text-sm font-semibold text-gray-900 mb-1">Auto Redeploy on Git Push</label>
                                                <p className="text-xs text-gray-600">Automatically redeploy when changes are pushed to the repository</p>
                                            </div>
                                            <button
                                                onClick={handleAutoRedeployChange}
                                                disabled={isSaving}
                                                className={`relative inline-flex h-8 w-14 items-center justify-start rounded-full transition-colors shrink-0 ${formData.autoRedeploy ? 'bg-emerald-500' : 'bg-gray-300'
                                                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
                                            >
                                                <span
                                                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${formData.autoRedeploy ? 'translate-x-7' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Git Settings */}
                    <div id="git" className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_8px_24px_rgba(17,24,39,0.08)] overflow-hidden group">
                        <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-purple-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-green-400/60 via-emerald-400/40 to-transparent" />
                        <div className="relative px-6 py-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-green-100/80">
                                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.29 6.8 5.47 7.9.4.08.55-.18.55-.39 0-.2-.01-.73-.01-1.44-2.01.45-2.53-.9-2.69-1.3-.09-.23-.48-.94-.82-1.13-.28-.16-.68-.55-.01-.56.63-.01 1.08.6 1.23.85.72 1.25 1.87.9 2.33.69.07-.54.28-.9.51-1.11-1.78-.2-3.64-.92-3.64-4.09 0-.9.31-1.64.82-2.22-.08-.2-.36-1.03.08-2.15 0 0 .67-.22 2.2.85.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.07 2.2-.85 2.2-.85.44 1.12.16 1.95.08 2.15.51.58.82 1.32.82 2.22 0 3.18-1.87 3.88-3.65 4.08.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.47.55.39C13.71 15.13 16 12.01 16 8.33 16 3.73 12.42 0 8 0Z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Git Configuration</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Repository URL</label>
                                    <input
                                        type="text"
                                        name="gitRepositoryUrl"
                                        value={formData.gitRepositoryUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://github.com/username/repo.git"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Your GitHub repository URL</p>
                                    {editingField === 'gitRepositoryUrl' && (
                                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={() => handleSaveField('gitRepositoryUrl')}
                                                disabled={isSaving}
                                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                                            >
                                                {isSaving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={() => handleCancelEdit('gitRepositoryUrl')}
                                                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Build & Deployment Settings */}
                    <div id="build" className="space-y-6">
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_8px_24px_rgba(17,24,39,0.08)] overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-purple-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-purple-400/60 via-pink-400/40 to-transparent" />
                            <div className="relative px-6 py-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-xl bg-purple-100/80">
                                        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Build Configuration</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Root Directory</label>
                                        <input
                                            type="text"
                                            name="rootDirectory"
                                            value={formData.rootDirectory}
                                            onChange={handleInputChange}
                                            placeholder="./"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Directory relative to repo root where your code is located</p>
                                        {editingField === 'rootDirectory' && (
                                            <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={() => handleSaveField('rootDirectory')}
                                                    disabled={isSaving}
                                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                                                >
                                                    {isSaving ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={() => handleCancelEdit('rootDirectory')}
                                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Install Command</label>
                                        <input
                                            type="text"
                                            name="installCommand"
                                            value={formData.installCommand}
                                            onChange={handleInputChange}
                                            placeholder="npm install"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Command to install dependencies (npm install, yarn install, etc)</p>
                                        {editingField === 'installCommand' && (
                                            <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={() => handleSaveField('installCommand')}
                                                    disabled={isSaving}
                                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                                                >
                                                    {isSaving ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={() => handleCancelEdit('installCommand')}
                                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Build Command</label>
                                        <input
                                            type="text"
                                            name="buildCommand"
                                            value={formData.buildCommand}
                                            onChange={handleInputChange}
                                            placeholder="npm run build"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Command to build your project (npm run build, npm run build:prod, etc)</p>
                                        {editingField === 'buildCommand' && (
                                            <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={() => handleSaveField('buildCommand')}
                                                    disabled={isSaving}
                                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                                                >
                                                    {isSaving ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={() => handleCancelEdit('buildCommand')}
                                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div id="danger" className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_8px_24px_rgba(17,24,39,0.08)] overflow-hidden group">
                        <div className="absolute inset-0 bg-linear-to-br from-red-50/50 via-orange-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-red-400/60 via-orange-400/40 to-transparent" />
                        <div className="relative px-6 py-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-red-100/80">
                                    <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Danger Zone</h3>
                            </div>

                            <button
                                onClick={handleDeleteProject}
                                disabled={isSaving}
                                className="w-full px-6 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Project
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* GitHub Auth Modal */}
            {showGitHubAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-400 via-sky-400 to-transparent" />
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100/80 mx-auto mb-4">
                                <svg className="h-6 w-6 text-orange-600" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.29 6.8 5.47 7.9.4.08.55-.18.55-.39 0-.2-.01-.73-.01-1.44-2.01.45-2.53-.9-2.69-1.3-.09-.23-.48-.94-.82-1.13-.28-.16-.68-.55-.01-.56.63-.01 1.08.6 1.23.85.72 1.25 1.87.9 2.33.69.07-.54.28-.9.51-1.11-1.78-.2-3.64-.92-3.64-4.09 0-.9.31-1.64.82-2.22-.08-.2-.36-1.03.08-2.15 0 0 .67-.22 2.2.85.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.07 2.2-.85 2.2-.85.44 1.12.16 1.95.08 2.15.51.58.82 1.32.82 2.22 0 3.18-1.87 3.88-3.65 4.08.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.47.55.39C13.71 15.13 16 12.01 16 8.33 16 3.73 12.42 0 8 0Z" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                                GitHub Authentication Required
                            </h3>
                            <p className="text-gray-600 text-center text-sm mb-6">
                                To enable auto-redeploy webhooks, you need to authenticate with GitHub first. This allows us to create and manage webhooks on your behalf.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleGitHubAuthClick}
                                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.29 6.8 5.47 7.9.4.08.55-.18.55-.39 0-.2-.01-.73-.01-1.44-2.01.45-2.53-.9-2.69-1.3-.09-.23-.48-.94-.82-1.13-.28-.16-.68-.55-.01-.56.63-.01 1.08.6 1.23.85.72 1.25 1.87.9 2.33.69.07-.54.28-.9.51-1.11-1.78-.2-3.64-.92-3.64-4.09 0-.9.31-1.64.82-2.22-.08-.2-.36-1.03.08-2.15 0 0 .67-.22 2.2.85.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.07 2.2-.85 2.2-.85.44 1.12.16 1.95.08 2.15.51.58.82 1.32.82 2.22 0 3.18-1.87 3.88-3.65 4.08.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.47.55.39C13.71 15.13 16 12.01 16 8.33 16 3.73 12.42 0 8 0Z" />
                                    </svg>
                                    Go to Profile Settings
                                </button>
                                <button
                                    onClick={() => setShowGitHubAuthModal(false)}
                                    className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-red-400 via-orange-400 to-transparent" />
                        <div className="p-6 sm:p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Delete Project
                            </h3>
                            <p className="text-gray-600 text-sm mb-6">
                                This will permanently delete the project and related resources like Deployments, Domains and Environment Variables.
                            </p>

                            <div className="space-y-5 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        To confirm, type "<span className="text-amber-700">{formData.projectName}</span>"
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteProjectNameInput}
                                        onChange={(e) => setDeleteProjectNameInput(e.target.value)}
                                        placeholder={formData.projectName}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        To confirm, type "<span className="text-amber-700">delete my project</span>"
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirmationInput}
                                        onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                                        placeholder="delete my project"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {deleteProjectNameInput === formData.projectName && deleteConfirmationInput === 'delete my project' && (
                                <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                                    <svg className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-amber-700">
                                        Deleting <span className="font-semibold">{formData.projectName}</span> cannot be undone.
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setDeleteProjectNameInput('')
                                        setDeleteConfirmationInput('')
                                    }}
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={deleteProjectNameInput !== formData.projectName || deleteConfirmationInput !== 'delete my project' || isSaving}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Deleting...' : 'Delete Project'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProjectSettings
