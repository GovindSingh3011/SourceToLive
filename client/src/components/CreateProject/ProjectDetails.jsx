import { useState } from 'react'

function ProjectDetails({ gitUrl, onDeploy, onBack, isLoading }) {
    const [projectId, setProjectId] = useState('')
    const [installCmd, setInstallCmd] = useState('npm install')
    const [buildCmd, setBuildCmd] = useState('npm run build')
    const [buildRoot, setBuildRoot] = useState('')
    const [errors, setErrors] = useState({})
    const [checkingProjectId, setCheckingProjectId] = useState(false)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    const checkProjectIdExists = async (id) => {
        if (!id.trim() || !/^[a-z0-9-]+$/.test(id)) {
            return false
        }

        try {
            setCheckingProjectId(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/project/${id.trim()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            // If status is 200, project exists; if 404, project doesn't exist
            return response.status === 200
        } catch (err) {
            console.error('Error checking project ID:', err)
            return false
        } finally {
            setCheckingProjectId(false)
        }
    }

    const handleProjectIdBlur = async () => {
        if (projectId.trim() && !/^[a-z0-9-]+$/.test(projectId)) {
            return // Let validateForm handle format errors
        }

        if (projectId.trim()) {
            const exists = await checkProjectIdExists(projectId)
            if (exists) {
                setErrors({ ...errors, projectId: 'A project with this name already exists. Please use a different project name.' })
            }
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!projectId.trim()) {
            newErrors.projectId = 'Project Name is required'
        } else if (!/^[a-z0-9-]+$/.test(projectId)) {
            newErrors.projectId = 'Project Name can only contain lowercase letters, numbers, and hyphens'
        }

        if (!installCmd.trim()) {
            newErrors.installCmd = 'Install command is required'
        }

        if (!buildCmd.trim()) {
            newErrors.buildCmd = 'Build command is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleDeploy = () => {
        // Check if there's already a duplicate project ID error
        if (errors.projectId) {
            return
        }

        if (!validateForm()) {
            return
        }

        onDeploy({
            projectId: projectId.trim(),
            installCmd: installCmd.trim(),
            buildCmd: buildCmd.trim(),
            buildRoot: buildRoot.trim(),
        })
    }

    return (
        <div className="flex justify-center w-full px-3 sm:px-4 py-4 sm:py-6 min-h-screen">
            <div className="w-full max-w-3xl">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    disabled={isLoading}
                    className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all text-xs sm:text-sm font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* Main Card */}
                <div
                    className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-5 sm:p-8 md:p-10 animate-in fade-in slide-in-from-bottom-5 duration-300"
                    style={{
                        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(249,250,251,0.9))',
                    }}
                >
                    {/* Header Section */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-purple-500 to-purple-600 text-white text-xl sm:text-2xl shrink-0">
                                <svg className="w-6 sm:w-8 h-6 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 m-0">Configuration</h2>
                                <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1">Step 2 of 3</p>
                            </div>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">Configure your build settings and deployment preferences</p>
                        <div className="h-px bg-linear-to-r from-gray-200 via-gray-200 to-transparent mt-4 sm:mt-6"></div>
                    </div>

                    {/* Repository Info Card */}
                    <div className="bg-linear-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-lg sm:rounded-2xl p-3 sm:p-5 mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="inline-flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-white border border-blue-200 text-sm sm:text-lg shrink-0">
                                    <svg className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.544 2.914 1.19.092-.926.35-1.546.636-1.9-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.135 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-blue-600 text-xs font-bold uppercase tracking-widest m-0">Repository</p>
                                    <p className="text-gray-900 text-xs sm:text-sm font-semibold m-0 truncate">{gitUrl.split('/').slice(-2).join('/')}</p>
                                </div>
                            </div>
                            <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-widest shrink-0">
                                main
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={(e) => { e.preventDefault(); handleDeploy() }} className="flex flex-col gap-4 sm:gap-6">
                        {/* Project Name */}
                        <div>
                            <label htmlFor="projectId" className="flex text-xs font-bold text-gray-700 mb-2 sm:mb-3 uppercase tracking-widest items-center gap-2">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                Project Name
                            </label>
                            <input
                                id="projectId"
                                type="text"
                                value={projectId}
                                onChange={(e) => {
                                    setProjectId(e.target.value)
                                    if (errors.projectId) setErrors({ ...errors, projectId: '' })
                                }}
                                onBlur={handleProjectIdBlur}
                                placeholder="e.g. my-project-123"
                                disabled={isLoading || checkingProjectId}
                                className={`w-full h-10 sm:h-12 px-3 sm:px-4 bg-white border-2 rounded-lg sm:rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 font-medium ${errors.projectId
                                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-200/40'
                                    : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                                    } ${(isLoading || checkingProjectId) ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''}`}
                            />
                            {checkingProjectId && <span className="flex text-blue-600 mt-1 sm:mt-2 text-xs font-medium items-center gap-1">⏳ Checking availability...</span>}
                            {errors.projectId && <span className="flex text-red-600 mt-1 sm:mt-2 text-xs font-medium items-center gap-1">⚠️ {errors.projectId}</span>}
                        </div>

                        {/* Install Command */}
                        <div>
                            <label htmlFor="installCmd" className="flex text-xs font-bold text-gray-700 mb-2 sm:mb-3 uppercase tracking-widest items-center gap-2">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Install Command
                            </label>
                            <input
                                id="installCmd"
                                type="text"
                                value={installCmd}
                                onChange={(e) => {
                                    setInstallCmd(e.target.value)
                                    if (errors.installCmd) setErrors({ ...errors, installCmd: '' })
                                }}
                                placeholder="npm install"
                                disabled={isLoading}
                                className={`w-full h-10 sm:h-12 px-3 sm:px-4 bg-white border-2 rounded-lg sm:rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 font-medium ${errors.installCmd
                                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-200/40'
                                    : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                    } ${isLoading ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''}`}
                            />
                            {errors.installCmd && <span className="flex text-red-600 mt-1 sm:mt-2 text-xs font-medium items-center gap-1">⚠️ {errors.installCmd}</span>}
                            <p className="text-gray-500 text-xs mt-1.5 sm:mt-2">yarn install, pnpm install, npm install or bun install</p>
                        </div>

                        {/* Build Command */}
                        <div>
                            <label htmlFor="buildCmd" className="flex text-xs font-bold text-gray-700 mb-2 sm:mb-3 uppercase tracking-widest items-center gap-2">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Build Command
                            </label>
                            <input
                                id="buildCmd"
                                type="text"
                                value={buildCmd}
                                onChange={(e) => {
                                    setBuildCmd(e.target.value)
                                    if (errors.buildCmd) setErrors({ ...errors, buildCmd: '' })
                                }}
                                placeholder="npm run build"
                                disabled={isLoading}
                                className={`w-full h-10 sm:h-12 px-3 sm:px-4 bg-white border-2 rounded-lg sm:rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 font-medium ${errors.buildCmd
                                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-200/40'
                                    : 'border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                                    } ${isLoading ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''}`}
                            />
                            {errors.buildCmd && <span className="flex text-red-600 mt-1 sm:mt-2 text-xs font-medium items-center gap-1">⚠️ {errors.buildCmd}</span>}
                            <p className="text-gray-500 text-xs mt-1.5 sm:mt-2">npm run build, yarn build, vite build, etc.</p>
                        </div>

                        {/* Build Root Directory */}
                        <div>
                            <label htmlFor="buildRoot" className="flex text-xs font-bold text-gray-700 mb-2 sm:mb-3 uppercase tracking-widest items-center gap-2">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Build Root Directory (Optional)
                            </label>
                            <input
                                id="buildRoot"
                                type="text"
                                value={buildRoot}
                                onChange={(e) => setBuildRoot(e.target.value)}
                                placeholder="e.g. client/ or packages/web"
                                disabled={isLoading}
                                className={`w-full h-10 sm:h-12 px-3 sm:px-4 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 font-medium ${isLoading ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''}`}
                            />
                            <p className="text-gray-500 text-xs mt-1.5 sm:mt-2">Path to the directory to build (if not root)</p>
                        </div>

                        {/* Button Group */}
                        <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onBack}
                                disabled={isLoading}
                                className="flex-1 h-10 sm:h-12 px-4 sm:px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2"
                            >
                                <svg className="w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 h-10 sm:h-12 px-4 sm:px-6 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 hover:shadow-[0_8px_24px_rgba(34,197,94,0.35)] hover:-translate-y-0.5 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-1 sm:gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deploying...
                                    </>
                                ) : (
                                    <>
                                        Deploy
                                        <svg className="w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ProjectDetails
