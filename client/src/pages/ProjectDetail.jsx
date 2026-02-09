import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function ProjectDetail() {
    const navigate = useNavigate()
    const { projectId } = useParams()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [buildLogs, setBuildLogs] = useState([])
    const [logsLoading, setLogsLoading] = useState(false)
    const [showLogs, setShowLogs] = useState(false)
    const [selectedLog, setSelectedLog] = useState(null)
    const [redeployLoading, setRedeployLoading] = useState(false)

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
            setError(null)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching project:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchBuildLogs = async (token) => {
        if (buildLogs.length > 0) {
            setShowLogs(!showLogs)
            return
        }

        try {
            setLogsLoading(true)
            const response = await fetch(`${apiUrl}/api/project/${projectId}/logs/archive`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch build logs')
            }

            const data = await response.json()
            setBuildLogs(data.items || [])
            setShowLogs(true)
        } catch (err) {
            console.error('Error fetching build logs:', err)
            alert('Error loading build logs: ' + err.message)
        } finally {
            setLogsLoading(false)
        }
    }

    const handleBuildLogsClick = () => {
        const token = localStorage.getItem('token')
        if (token) {
            fetchBuildLogs(token)
        }
    }

    const handleRedeploy = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }

        try {
            setRedeployLoading(true)
            const response = await fetch(`${apiUrl}/api/project/${projectId}/redeploy`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (!response.ok) {
                throw new Error('Failed to redeploy project')
            }
            fetchProjectDetail(token)
        } catch (err) {
            console.error('Error redeploying project:', err)
            alert('Error redeploying project: ' + err.message)
        } finally {
            setRedeployLoading(false)
        }
    }

    const getRepoDisplay = (url) => {
        if (!url) return ''
        const trimmed = url.trim()

        const httpsMatch = trimmed.match(/github\.com\/?([\w.-]+)\/([\w.-]+)(?:\.git)?\/?$/i)
        if (httpsMatch) return `${httpsMatch[1]}/${httpsMatch[2]}`

        const sshMatch = trimmed.match(/git@github\.com:([\w.-]+)\/([\w.-]+)(?:\.git)?$/i)
        if (sshMatch) return `${sshMatch[1]}/${sshMatch[2]}`

        return trimmed
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'success':
            case 'deployed':
                return 'bg-green-100 text-green-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            case 'building':
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const formatDate = (date) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading project details...</p>
                </div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl p-8 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Project</h2>
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
        <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 ">
            {/* Header */}
            <div className="relative overflow-hidden border-b border-gray-200/70 bg-white/80 backdrop-blur-sm">
                <div className="absolute inset-0 bg-linear-to-br from-blue-100/40 via-purple-50/20 to-transparent" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-fit text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </button>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div>
                                <h1 className="pb-2 text-4xl sm:text-5xl font-extrabold bg-linear-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                                    {project.projectId}
                                </h1>
                                <p className="text-gray-600 text-sm mt-3">
                                    Project overview and deployment management
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                <button
                                    onClick={handleRedeploy}
                                    disabled={redeployLoading}
                                    className="w-full sm:w-auto h-11 px-6 bg-linear-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 disabled:from-gray-400 disabled:to-gray-400 text-white text-sm font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                                >
                                    {redeployLoading ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Redeploying...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Redeploy
                                        </>
                                    )}
                                </button>
                                {project.gitRepositoryUrl && (
                                    <a
                                        href={project.gitRepositoryUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full sm:w-auto h-11 px-6 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.29 6.8 5.47 7.9.4.08.55-.18.55-.39 0-.2-.01-.73-.01-1.44-2.01.45-2.53-.9-2.69-1.3-.09-.23-.48-.94-.82-1.13-.28-.16-.68-.55-.01-.56.63-.01 1.08.6 1.23.85.72 1.25 1.87.9 2.33.69.07-.54.28-.9.51-1.11-1.78-.2-3.64-.92-3.64-4.09 0-.9.31-1.64.82-2.22-.08-.2-.36-1.03.08-2.15 0 0 .67-.22 2.2.85.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.07 2.2-.85 2.2-.85.44 1.12.16 1.95.08 2.15.51.58.82 1.32.82 2.22 0 3.18-1.87 3.88-3.65 4.08.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.47.55.39C13.71 15.13 16 12.01 16 8.33 16 3.73 12.42 0 8 0Z" />
                                        </svg>
                                        Repository
                                    </a>
                                )}
                                <button
                                    onClick={() => navigate(`/project/${projectId}/settings`)}
                                    className="h-11 px-6 cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Deployment Card */}
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_8px_24px_rgba(17,24,39,0.08)] overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-purple-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-400/60 via-sky-400/40 to-transparent" />
                            <div className="relative px-6 py-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-xl bg-blue-100/80">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Deployment</h3>
                                </div>
                                {project.deployUrl ? (
                                    <a
                                        href={project.deployUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50/80 border border-blue-100/60 hover:border-blue-200 hover:bg-blue-50 text-blue-700 text-sm font-semibold transition-all duration-200"
                                        title={project.deployUrl}
                                    >
                                        {project.deployUrl.replace(/^https?:\/\//, '')}
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                ) : (
                                    <p className="text-gray-500 text-sm font-medium">Not deployed yet</p>
                                )}
                            </div>
                        </div>

                        {/* Source Card */}
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_8px_24px_rgba(17,24,39,0.08)] overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-purple-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-green-400/60 via-emerald-400/40 to-transparent" />
                            <div className="relative px-6 py-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-xl bg-green-100/80">
                                        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.29 6.8 5.47 7.9.4.08.55-.18.55-.39 0-.2-.01-.73-.01-1.44-2.01.45-2.53-.9-2.69-1.3-.09-.23-.48-.94-.82-1.13-.28-.16-.68-.55-.01-.56.63-.01 1.08.6 1.23.85.72 1.25 1.87.9 2.33.69.07-.54.28-.9.51-1.11-1.78-.2-3.64-.92-3.64-4.09 0-.9.31-1.64.82-2.22-.08-.2-.36-1.03.08-2.15 0 0 .67-.22 2.2.85.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.07 2.2-.85 2.2-.85.44 1.12.16 1.95.08 2.15.51.58.82 1.32.82 2.22 0 3.18-1.87 3.88-3.65 4.08.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.47.55.39C13.71 15.13 16 12.01 16 8.33 16 3.73 12.42 0 8 0Z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Source</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Repository</p>
                                            <p className="text-gray-900 font-semibold break-all">{getRepoDisplay(project.gitRepositoryUrl)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Branch</p>
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h10a2 2 0 002-2v-5.5a2.5 2.5 0 00-5 0V15a2 2 0 002 2z" />
                                                </svg>
                                                {project.defaultBranch || project.branchName || project.branch || 'main'}
                                            </div>
                                        </div>
                                    </div>
                                    {project.lastCommitMessage && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Last Commit</p>
                                            <p className="text-gray-700 text-sm">{project.lastCommitMessage.split('\n')[0].trim()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Status Info */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_8px_24px_rgba(17,24,39,0.08)] overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-purple-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative px-6 py-6 space-y-6">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Deployment Status</p>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-3 w-3 rounded-full animate-pulse ${project.status?.toLowerCase() === 'success' || project.status?.toLowerCase() === 'finished' || project.status?.toLowerCase() === 'deployed'
                                            ? 'bg-green-500'
                                            : project.status?.toLowerCase() === 'failed'
                                                ? 'bg-red-500'
                                                : project.status?.toLowerCase() === 'building' || project.status?.toLowerCase() === 'running'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-gray-400'
                                            }`}></div>
                                        <div>
                                            <p className="text-gray-900 font-bold text-lg capitalize">{project.status || 'Unknown'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Auto Redeploy</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${project.autoRedeploy ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <p className="text-gray-900 font-semibold text-sm">
                                            {project.autoRedeploy ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Card */}
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_8px_24px_rgba(17,24,39,0.08)] overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-purple-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative px-6 py-6 space-y-6">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Created At</p>
                                    <p className="text-gray-900 font-semibold text-sm">
                                        {formatDate(project.createdAt)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Last Updated</p>
                                    <p className="text-gray-900 font-semibold text-sm">
                                        {formatDate(project.updatedAt || project.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Build Logs Card - Shows at end on mobile, after status on desktop */}
                    <div className="lg:col-span-3">
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_8px_24px_rgba(17,24,39,0.08)] overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-purple-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-purple-400/60 via-pink-400/40 to-transparent" />
                            <div className="relative px-6 py-6">
                                <button
                                    onClick={handleBuildLogsClick}
                                    disabled={logsLoading}
                                    className="w-full flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-purple-100/80">
                                            {logsLoading ? (
                                                <svg className="h-5 w-5 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{logsLoading ? 'Loading Logs...' : 'Build Logs'}</h3>
                                    </div>
                                    {!logsLoading && (
                                        <svg
                                            className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${showLogs ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    )}
                                </button>

                                {showLogs && (
                                    <div className="mt-6">
                                        {logsLoading ? (
                                            <div className="p-6 text-center bg-gray-50/80 rounded-xl">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                                                <p className="text-sm text-gray-600">Loading logs...</p>
                                            </div>
                                        ) : buildLogs.length === 0 ? (
                                            <div className="p-6 text-center bg-gray-50/80 rounded-xl">
                                                <p className="text-sm text-gray-600">No build logs available</p>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-900 rounded-xl p-4 max-h-96 overflow-y-auto">
                                                <div className="font-mono text-xs leading-relaxed space-y-1">
                                                    {buildLogs.map((log, index) => {
                                                        const tsNum = (() => {
                                                            const candidates = [log.ts, log.time, log.timestamp, log.createdAt]
                                                            for (const c of candidates) {
                                                                if (c === undefined || c === null) continue
                                                                const n = Number(c)
                                                                if (!Number.isNaN(n)) return n
                                                            }
                                                            return Date.now()
                                                        })()

                                                        const raw = log.message ?? ''
                                                        let msg = ''
                                                        try {
                                                            if (typeof raw === 'string' && raw.trim().startsWith('{')) {
                                                                const parsed = JSON.parse(raw)
                                                                msg = parsed.message || parsed.msg || parsed.event || parsed.log || ''
                                                                if (!msg && (parsed.file || parsed.filename || parsed.path)) {
                                                                    msg = parsed.file || parsed.filename || parsed.path
                                                                } else if (parsed.file) {
                                                                    msg = `${msg} ${parsed.file}`.trim()
                                                                }
                                                                if (!msg) msg = JSON.stringify(parsed)
                                                            } else {
                                                                msg = String(raw)
                                                            }
                                                        } catch (e) {
                                                            msg = String(raw)
                                                        }

                                                        msg = msg.replace(/\s+/g, ' ').trim()
                                                        const isSuccess = msg.includes('✓') || msg.includes('success')
                                                        const isError = msg.includes('✗') || msg.includes('error')

                                                        return (
                                                            <div key={index} className="flex gap-3 py-1 text-slate-300 hover:bg-gray-800/50 px-2 rounded transition-colors">
                                                                <span className="text-slate-500 shrink-0 text-xs">{new Date(tsNum).toLocaleTimeString()}</span>
                                                                <span className={`flex-1 ${isSuccess ? 'text-green-400' : isError ? 'text-red-400' : 'text-slate-300'}`}>
                                                                    {msg}
                                                                </span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectDetail
