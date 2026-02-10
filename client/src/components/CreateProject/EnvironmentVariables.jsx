function EnvironmentVariables({ variables = [], onVariablesChange, isDisabled = false }) {
    const addVariable = () => {
        onVariablesChange([...variables, { key: '', value: '' }])
    }

    const removeVariable = (index) => {
        onVariablesChange(variables.filter((_, i) => i !== index))
    }

    const updateVariable = (index, field, value) => {
        const updated = [...variables]
        updated[index] = { ...updated[index], [field]: value }
        onVariablesChange(updated)
    }

    const handleKeyChange = (index, value) => {
        const lines = value.split(/\r?\n/).filter(line => line.trim().length > 0)
        const parsed = []

        lines.forEach((line) => {
            const trimmedLine = line.trim()
            if (!trimmedLine) return

            // Parse tokens to support mixed "KEY VALUE" and "KEY=VALUE" formats
            const tokens = trimmedLine.split(/\s+/).filter(token => token.length > 0)
            for (let i = 0; i < tokens.length; i += 1) {
                const token = tokens[i]

                if (token.includes('=')) {
                    const eqIndex = token.indexOf('=')
                    parsed.push({
                        key: token.substring(0, eqIndex).trim(),
                        value: token.substring(eqIndex + 1).trim(),
                    })
                    continue
                }

                const nextToken = tokens[i + 1]
                if (nextToken && !nextToken.includes('=')) {
                    parsed.push({ key: token.trim(), value: nextToken.trim() })
                    i += 1
                } else {
                    parsed.push({ key: token.trim(), value: '' })
                }
            }
        })

        const hasWhitespace = /\s/.test(value)
        if (parsed.length > 0 && (parsed.length > 1 || value.includes('=') || hasWhitespace)) {
            const updated = [...variables]
            updated[index] = parsed[0]
            if (parsed.length > 1) {
                updated.splice(index + 1, 0, ...parsed.slice(1))
            }
            onVariablesChange(updated)
            return
        }

        updateVariable(index, 'key', value)
    }

    return (
        <div className="w-full">
            {/* Section Header */}
            <label className="flex text-xs font-bold text-gray-700 mb-2 sm:mb-3 uppercase tracking-widest items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                Environment Variables (Optional)
            </label>

            {/* Variables List */}
            <div className="space-y-3 sm:space-y-4">
                {/* Header Row */}
                <div className="hidden sm:flex gap-2 sm:gap-3 items-center">
                    <div className="flex-1">
                        <label className="px-5 block text-xs font-bold text-gray-600 uppercase tracking-wide">
                            Key
                        </label>
                    </div>
                    <div className="flex-1">
                        <label className="px-5 block text-xs font-bold text-gray-600 uppercase tracking-wide">
                            Value
                        </label>
                    </div>
                    <div className="w-9 sm:w-10"></div>
                </div>

                {/* Input Rows */}
                {(variables.length > 0 ? variables : [{ key: '', value: '' }]).map((variable, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
                        {/* Key Input */}
                        <div className="flex-1 w-full">
                            <input
                                type="text"
                                value={variable.key}
                                onChange={(e) => handleKeyChange(index, e.target.value)}
                                disabled={isDisabled}
                                placeholder="API_URL"
                                className={`w-full h-10 sm:h-12 px-3 sm:px-4 bg-white border-2 rounded-lg sm:rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 font-medium ${isDisabled ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10'}`}
                            />
                        </div>

                        {/* Value Input */}
                        <div className="flex-1 w-full">
                            <input
                                type="text"
                                value={variable.value}
                                onChange={(e) => updateVariable(index, 'value', e.target.value)}
                                disabled={isDisabled}
                                placeholder="https://api.example.com"
                                className={`w-full h-10 sm:h-12 px-3 sm:px-4 bg-white border-2 rounded-lg sm:rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-all duration-300 font-medium ${isDisabled ? 'bg-gray-50 cursor-not-allowed text-gray-600' : 'border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10'}`}
                            />
                        </div>

                        {/* Remove Button */}
                        <div className="flex sm:block justify-end">
                            <button
                                type="button"
                                onClick={() => removeVariable(index)}
                                disabled={isDisabled || variables.length === 0}
                                className="w-9 sm:w-10 h-10 sm:h-12 cursor-pointer flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                                title="Remove variable"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 12H4"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add More Button */}
                <button
                    type="button"
                    onClick={addVariable}
                    disabled={isDisabled}
                    className="cursor-pointer inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-gray-700 bg-white border-2 border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Add More
                </button>
            </div>
        </div>
    )
}

export default EnvironmentVariables