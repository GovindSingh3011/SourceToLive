import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [projects, setProjects] = useState([])
    const [filteredProjects, setFilteredProjects] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    useEffect(() => {
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (!token || !storedUser) {
            navigate('/login')
            return
        }

        try {
            setUser(JSON.parse(storedUser))
            fetchProjects(token)
        } catch (err) {
            navigate('/login')
        }
    }, [navigate])

    const fetchProjects = async (token) => {
        try {
            setLoading(true)
            console.log('Fetching projects from:', `${apiUrl}/api/project`)
            const response = await fetch(`${apiUrl}/api/project`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            console.log('Response status:', response.status)

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login')
                    return
                }
                throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`)
            }

            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Response is not JSON:', contentType)
                throw new Error('Invalid response format from server')
            }

            const data = await response.json()
            const projectsList = data.items || []
            setProjects(projectsList)
            setFilteredProjects(projectsList)
        } catch (error) {
            console.error('Error fetching projects:', error.message)
            console.error('Full error:', error)
            // Only show alert for non-network errors
            if (error.message !== 'Failed to fetch') {
                alert(`Error loading projects: ${error.message}`)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (query) => {
        setSearchQuery(query)
        const filtered = projects.filter(project =>
            project.projectId?.toLowerCase().includes(query.toLowerCase()) ||
            project.gitRepositoryUrl?.toLowerCase().includes(query.toLowerCase())
        )
        setFilteredProjects(filtered)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        })
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

    const getCommitMessage = (message) => {
        if (!message) return 'No commits yet'
        return message.split('\n')[0].trim()
    }

    return (
        <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50">
            {/* Header with Welcome and Create Button */}
            <div className="relative overflow-hidden border-b border-gray-200/70 bg-white/80 backdrop-blur-sm">
                <div className="absolute inset-0 bg-linear-to-br from-blue-100/40 via-purple-50/20 to-transparent" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-700">
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                                Dashboard
                            </div>
                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <h1 className="text-4xl sm:text-5xl font-extrabold bg-linear-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                                    Welcome{user?.firstName ? `, ${user.firstName}` : ''}
                                </h1>
                            </div>
                            <p className="text-gray-600 text-base mt-4 max-w-2xl">
                                Seamlessly monitor deployments and launch new projects in seconds.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar Section */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/70 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 bg-linear-to-r from-gray-50 to-slate-50 rounded-2xl px-5 py-3.5 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-400/50 focus-within:border-blue-400 focus-within:shadow-lg transition-all duration-200">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by project name or repository URL"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                            <div className="text-xs text-gray-500">
                                Showing <span className="font-semibold text-gray-700">{filteredProjects.length}</span> of{' '}
                                <span className="font-semibold text-gray-700">{projects.length}</span> projects
                            </div>
                            <button
                                onClick={() => navigate('/create-project')}
                                className="h-11 px-6 w-full sm:w-auto bg-linear-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white text-sm font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading projects...</p>
                        </div>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-2xl p-8 border border-gray-200">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <h3 className="text-gray-600 text-lg font-semibold mb-2">
                                {searchQuery ? 'No projects found' : 'No projects yet'}
                            </h3>
                            <p className="text-gray-500 text-sm mb-6">
                                {searchQuery
                                    ? 'Try adjusting your search terms'
                                    : 'Create your first project to get started with deployment'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => navigate('/create-project')}
                                    className="inline-block h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors"
                                >
                                    Create Your First Project
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <div
                                key={project._id}
                                onClick={() => navigate(`/project/${project.projectId}`)}
                                className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_8px_24px_rgba(17,24,39,0.08)] hover:border-blue-300 hover:shadow-[0_16px_48px_rgba(59,130,246,0.15)] hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer group"
                            >
                                <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-purple-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-400/60 via-sky-400/40 to-transparent" />

                                {/* Header */}
                                <div className="relative px-6 pt-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                                {project.projectId}
                                            </h3>
                                            <p className="text-sm text-gray-500 truncate mt-1" title={project.deployUrl || project.gitRepositoryUrl}>
                                                {project.deployUrl || getRepoDisplay(project.gitRepositoryUrl)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                                            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                <path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.29 6.8 5.47 7.9.4.08.55-.18.55-.39 0-.2-.01-.73-.01-1.44-2.01.45-2.53-.9-2.69-1.3-.09-.23-.48-.94-.82-1.13-.28-.16-.68-.55-.01-.56.63-.01 1.08.6 1.23.85.72 1.25 1.87.9 2.33.69.07-.54.28-.9.51-1.11-1.78-.2-3.64-.92-3.64-4.09 0-.9.31-1.64.82-2.22-.08-.2-.36-1.03.08-2.15 0 0 .67-.22 2.2.85.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.07 2.2-.85 2.2-.85.44 1.12.16 1.95.08 2.15.51.58.82 1.32.82 2.22 0 3.18-1.87 3.88-3.65 4.08.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.47.55.39C13.71 15.13 16 12.01 16 8.33 16 3.73 12.42 0 8 0Z" />
                                            </svg>
                                            {getRepoDisplay(project.gitRepositoryUrl)}
                                        </span>
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M6 3v6a4 4 0 004 4h4a4 4 0 014 4v4" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M6 7h4a4 4 0 014 4v10" />
                                                <circle cx="6" cy="3" r="2" />
                                                <circle cx="6" cy="13" r="2" />
                                                <circle cx="18" cy="21" r="2" />
                                            </svg>
                                            {project.defaultBranch || project.branchName || project.branch || 'main'}
                                        </span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="relative px-6 py-5">
                                    <div className="flex items-start gap-2">
                                        <svg className="h-4 w-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M7 7h10M7 12h6m-6 5h10" />
                                        </svg>
                                        <p className="text-sm text-gray-800 font-semibold truncate" title={project.lastCommitMessage || 'No commits yet'}>
                                            {getCommitMessage(project.lastCommitMessage)}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <span>{formatDate(project.updatedAt || project.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard
