import { useEffect, useRef } from 'react'

function DeploymentLogs({ projectId, isDeploying, logs, deploymentUrl, error, projectConfig, gitUrl }) {
    const logsEndRef = useRef(null)

    useEffect(() => {
        // Auto-scroll to bottom when new logs arrive
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [logs])

    return (
        <div className="flex justify-center w-full px-3 sm:px-4 py-4 sm:py-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="w-full max-w-5xl">
                {/* Main Card */}
                <div
                    className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-5 sm:p-8 md:p-10"
                    style={{
                        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(249,250,251,0.9))',
                    }}
                >
                    {/* Header Section */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-cyan-500 to-teal-600 text-white text-xl sm:text-2xl shrink-0">
                                <svg className="w-6 sm:w-8 h-6 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 m-0">
                                    Deployment Progress
                                </h2>
                                <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1">Step 3 of 3</p>
                            </div>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">Monitor your deployment in real-time with live build logs and status updates</p>
                        <div className="h-px bg-linear-to-r from-gray-200 via-gray-200 to-transparent mt-4 sm:mt-6"></div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex gap-4 animate-in slide-in-from-top-2 duration-300">
                            <span className="text-2xl shrink-0">⚠️</span>
                            <div>
                                <strong className="block text-red-900 mb-1 text-base">Deployment Error</strong>
                                <p className="text-red-800 text-sm m-0 leading-relaxed">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Project Info Cards */}
                    {(logs.length > 0 || isDeploying || projectConfig) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                            {/* Project Name Card */}
                            <div className="bg-linear-to-br from-blue-50 to-blue-50/50 border border-blue-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Project Name
                                </p>
                                <p className="text-gray-900 font-semibold text-base sm:text-lg break-all">{projectConfig?.projectId || gitUrl?.split('/').slice(-1)[0] || projectId || 'N/A'}</p>
                            </div>

                            {/* Deploy Status Card */}
                            <div className="bg-linear-to-br from-indigo-50 to-indigo-50/50 border border-indigo-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                                <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                    Deployment Status
                                </p>
                                <div className="flex gap-3 items-center">
                                    {isDeploying && <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span><span className="text-indigo-700 text-sm sm:text-base font-semibold">In Progress</span></span>}
                                    {!isDeploying && logs.length > 0 && !error && <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-green-600 text-sm sm:text-base font-semibold">Completed</span></span>}
                                    {error && <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-red-600 text-sm sm:text-base font-semibold">Failed</span></span>}
                                </div>
                            </div>

                            {/* GitHub Repository Card */}
                            <div className="bg-linear-to-br from-amber-50 to-amber-50/50 border border-amber-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow md:col-span-1">
                                <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    GitHub Repository
                                </p>
                                <a href={gitUrl} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:text-amber-900 text-sm sm:text-base font-mono font-semibold break-all underline hover:no-underline transition-colors">
                                    {gitUrl?.split('/').slice(-2).join('/') || 'N/A'}
                                </a>
                            </div>

                            {/* Live URL Card */}
                            {deploymentUrl && (
                                <div className="bg-linear-to-br from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow md:col-span-1">
                                    <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Live URL
                                    </p>
                                    <div className="flex gap-3 items-start sm:items-center flex-col sm:flex-row">
                                        <a href={deploymentUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-900 text-sm sm:text-base font-mono font-semibold break-all underline hover:no-underline transition-colors flex-1">
                                            {deploymentUrl?.split('://')[1]?.split('/')[0] || 'N/A'}
                                        </a>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(deploymentUrl)}
                                            className="text-gray-600 hover:text-emerald-600 transition-colors shrink-0 hover:scale-110 transform duration-200 p-1.5 rounded hover:bg-emerald-50"
                                            title="Copy URL"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Logs Container */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6 min-h-72 sm:min-h-80 max-h-80 sm:max-h-96 overflow-hidden flex flex-col shadow-2xl">
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
                                <div className="mb-4">
                                    <svg className="w-16 h-16 mx-auto text-slate-500 opacity-50 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                                <p className="text-lg font-semibold mb-2">Waiting for deployment logs...</p>
                                <p className="text-sm text-slate-500">This may take a few moments</p>
                            </div>
                        ) : (
                            <div className="overflow-y-auto flex-1 flex flex-col">
                                <div className="overflow-y-auto flex-1 font-mono text-xs sm:text-sm leading-relaxed space-y-1">
                                    {logs.map((log, index) => {
                                        // Helper: get a numeric timestamp
                                        const tsNum = (() => {
                                            const candidates = [log.ts, log.time, log.timestamp, log.createdAt]
                                            for (const c of candidates) {
                                                if (c === undefined || c === null) continue
                                                const n = Number(c)
                                                if (!Number.isNaN(n)) return n
                                            }
                                            return Date.now()
                                        })()

                                        // Helper: normalize message (unwrap JSON payloads, strip newlines)
                                        const raw = log.message ?? ''
                                        let msg = ''
                                        try {
                                            if (typeof raw === 'string' && raw.trim().startsWith('{')) {
                                                const parsed = JSON.parse(raw)
                                                msg = parsed.message || parsed.msg || parsed.event || parsed.log || ''
                                                // append file/path info when available
                                                if (!msg && (parsed.file || parsed.filename || parsed.path)) {
                                                    msg = parsed.file || parsed.filename || parsed.path
                                                } else if (parsed.file) {
                                                    msg = `${msg} ${parsed.file}`.trim()
                                                } else if (parsed.files && Array.isArray(parsed.files)) {
                                                    msg = `${msg} ${parsed.files.join(', ')}`.trim()
                                                }
                                                if (!msg) msg = JSON.stringify(parsed)
                                            } else if (typeof raw === 'object') {
                                                msg = raw.message || raw.msg || raw.event || raw.log || ''
                                                if (!msg && (raw.file || raw.filename || raw.path)) {
                                                    msg = raw.file || raw.filename || raw.path
                                                } else if (raw.file) {
                                                    msg = `${msg} ${raw.file}`.trim()
                                                } else if (raw.files && Array.isArray(raw.files)) {
                                                    msg = `${msg} ${raw.files.join(', ')}`.trim()
                                                }
                                                if (!msg) msg = JSON.stringify(raw)
                                            } else {
                                                msg = String(raw)
                                            }
                                        } catch (e) {
                                            msg = String(raw)
                                        }

                                        // Clean up whitespace/newlines
                                        msg = msg.replace(/\s+/g, ' ').trim()

                                        // Determine if this is a success or error message
                                        const isSuccess = msg.includes('✓') || msg.includes('success') || msg.includes('completed')
                                        const isWarning = msg.includes('warning') || msg.includes('warn')
                                        const isError = msg.includes('✗') || msg.includes('error') || msg.includes('failed')

                                        return (
                                            <div key={index} className="flex gap-4 py-2 px-3 rounded hover:bg-slate-800/50 transition-colors group text-slate-200 border-b border-slate-800/30 last:border-b-0">
                                                <span className="text-slate-500 whitespace-nowrap shrink-0 min-w-fit text-xs opacity-70">
                                                    {new Date(tsNum).toLocaleTimeString()}
                                                </span>
                                                <span className={`wrap-break-word flex-1 ${isSuccess ? 'text-green-400' : isError ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-slate-200'}`}>
                                                    {msg}
                                                </span>
                                            </div>
                                        )
                                    })}
                                    <div ref={logsEndRef} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Success Message */}
                    {!isDeploying && logs.length > 0 && !deploymentUrl && !error && (
                        <div className="bg-linear-to-r from-blue-50 to-blue-50 border border-blue-300 rounded-2xl p-4 sm:p-5 text-blue-900 text-xs sm:text-sm animate-in slide-in-from-bottom-2 duration-300">
                            <p className="m-0 flex items-start gap-3">
                                <span className="text-lg shrink-0 mt-0.5">ℹ️</span>
                                <span className="leading-relaxed">Deployment logs streamed successfully. Check your live URL in the deployment info above.</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DeploymentLogs
