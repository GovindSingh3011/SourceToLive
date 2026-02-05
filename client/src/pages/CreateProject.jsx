import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GitURLInput from '../components/CreateProject/GitURLInput'
import ProjectDetails from '../components/CreateProject/ProjectDetails'
import DeploymentLogs from '../components/CreateProject/DeploymentLogs'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function CreateProject() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1: Git URL, 2: Details, 3: Logs
    const [gitUrl, setGitUrl] = useState('')
    const [projectConfig, setProjectConfig] = useState(null)
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

    const token = localStorage.getItem('token')
    const isAuthenticated = Boolean(token && user)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')
        if (!storedUser || !storedToken) {
            navigate('/login')
        }
    }, [navigate])

    const handleGitUrlContinue = (url) => {
        setGitUrl(url)
        setStep(2)
    }

    const handleProjectDetailsDeploy = async (config) => {
        if (!isAuthenticated) {
            setError('Please log in to create a project')
            return
        }

        const ownerName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
        const configWithOwner = { ...config, ownerName }
        setStep(3)
        setIsDeploying(true)
        setError('')
        setLogs([])
        setDeploymentUrl('')

        try {
            const headers = {
                'Content-Type': 'application/json',
            }

            // Add auth token if user is logged in
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const response = await fetch(`${API_URL}/api/project`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    GIT_REPOSITORY__URL: gitUrl,
                    PROJECT_ID: config.projectId,
                    INSTALL_CMD: config.installCmd,
                    BUILD_CMD: config.buildCmd,
                    BUILD_ROOT: config.buildRoot,
                    OWNER_NAME: ownerName,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create project')
            }

            const data = await response.json()
            setDeploymentUrl(data.data?.url || '')
            setProjectConfig(configWithOwner)

            // Add initial success message
            setLogs([{
                ts: Date.now(),
                message: `✓ Project queued successfully. Task ARN: ${data.data?.taskArn}`
            }])

            // Start streaming logs
            streamLogs(config.projectId)
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
                    setLogs(prev => [
                        ...prev,
                        { ts: Date.now(), message: '✓ Deployment completed!' }
                    ])
                    eventSource.close()
                    setIsDeploying(false)
                } else if (data.status === 'error') {
                    setLogs(prev => [
                        ...prev,
                        { ts: Date.now(), message: `✗ Error: ${data.message}` }
                    ])
                    setError(data.message || 'Deployment failed')
                    eventSource.close()
                    setIsDeploying(false)
                } else if (data.message) {
                    setLogs(prev => [
                        ...prev,
                        { ts: data.ts || Date.now(), message: data.message }
                    ])
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

    const handleBackToDetails = () => {
        setStep(2)
    }

    const handleBackToGitUrl = () => {
        setStep(1)
        setGitUrl('')
        setProjectConfig(null)
        setLogs([])
        setError('')
        setDeploymentUrl('')
    }

    return (
        <div className="bg-linear-to-br flex flex-col items-center justify-start relative w-full overflow-x-hidden px-3 sm:px-6">
            {isAuthenticated && (
                <>
                    {/* Progress Indicator */}
                    <div
                        className="w-full max-w-4xl mt-8 sm:mt-10 mb-6 sm:mb-8 bg-white/80 backdrop-blur-xl border-2 border-transparent bg-clip-padding rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] px-4 sm:px-8 py-5 sm:py-6 mx-auto"
                        style={{
                            backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgba(59, 125, 195, 0.15), rgba(76, 175, 80, 0.15))',
                            backgroundOrigin: 'padding-box, border-box',
                            backgroundClip: 'padding-box, border-box'
                        }}
                    >
                        <div className="flex justify-center items-center gap-4 sm:gap-6">
                            <div className={`flex flex-col items-center gap-2 transition-all ${step >= 1 ? '' : 'opacity-50'}`}>
                                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-bold text-base sm:text-lg transition-all ${step >= 1
                                    ? 'bg-linear-to-r from-[#3B7DC3] to-[#2A5F99] border-[#2A5F99] text-white shadow-lg'
                                    : 'bg-gray-100 border-gray-200 text-gray-600'
                                    }`}>
                                    1
                                </div>
                                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${step >= 1 ? 'text-[#2A5F99]' : 'text-gray-500'}`}>
                                    Repository
                                </span>
                            </div>

                            <div className={`w-10 sm:w-16 h-0.5 transition-all ${step >= 2 ? 'bg-gray-300' : 'bg-gray-200'}`}></div>

                            <div className={`flex flex-col items-center gap-2 transition-all ${step >= 2 ? '' : 'opacity-50'}`}>
                                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-bold text-base sm:text-lg transition-all ${step >= 2
                                    ? 'bg-linear-to-r from-[#3B7DC3] to-[#2A5F99] border-[#2A5F99] text-white shadow-lg'
                                    : 'bg-gray-100 border-gray-200 text-gray-600'
                                    }`}>
                                    2
                                </div>
                                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${step >= 2 ? 'text-[#2A5F99]' : 'text-gray-500'}`}>
                                    Configuration
                                </span>
                            </div>

                            <div className={`w-10 sm:w-16 h-0.5 transition-all ${step >= 3 ? 'bg-gray-300' : 'bg-gray-200'}`}></div>

                            <div className={`flex flex-col items-center gap-2 transition-all ${step >= 3 ? '' : 'opacity-50'}`}>
                                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-bold text-base sm:text-lg transition-all ${step >= 3
                                    ? 'bg-linear-to-r from-[#3B7DC3] to-[#2A5F99] border-[#2A5F99] text-white shadow-lg'
                                    : 'bg-gray-100 border-gray-200 text-gray-600'
                                    }`}>
                                    3
                                </div>
                                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${step >= 3 ? 'text-[#2A5F99]' : 'text-gray-500'}`}>
                                    Deploy
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex w-full max-w-5xl mx-auto pb-10 min-w-0">
                        {step === 1 && (
                            <GitURLInput
                                onContinue={handleGitUrlContinue}
                                isLoading={false}
                            />
                        )}

                        {step === 2 && (
                            <ProjectDetails
                                gitUrl={gitUrl}
                                onDeploy={handleProjectDetailsDeploy}
                                onBack={handleBackToGitUrl}
                                isLoading={false}
                            />
                        )}

                        {step === 3 && (
                            <DeploymentLogs
                                projectId={projectConfig?.projectId}
                                isDeploying={isDeploying}
                                logs={logs}
                                deploymentUrl={deploymentUrl}
                                error={error}
                                projectConfig={projectConfig}
                                gitUrl={gitUrl}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default CreateProject
