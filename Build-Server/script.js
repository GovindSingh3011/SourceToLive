const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const mime = require('mime-types')

require('dotenv').config()

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
})

const PROJECT_ID = process.env.PROJECT_ID

// List of system environment variables to exclude from user-defined env vars
const SYSTEM_ENV_VARS = [
    'PROJECT_ID',
    'GIT_REPOSITORY__URL',
    'S3_BUCKET',
    'INSTALL_CMD',
    'BUILD_CMD',
    'BUILD_ROOT',
    'GITHUB_TOKEN',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'NODE_ENV',
    'NODE_PATH',
    'PATH',
    'HOME',
    'USER',
    'TERM',
    'SHELL',
    'LANG',
    'LC_ALL',
    'PWD',
    'NO_UPDATE_NOTIFIER',
]

function getUserEnvironmentVariables() {
    const userEnv = {}
    const envKeys = Object.keys(process.env)

    for (const key of envKeys) {
        if (!SYSTEM_ENV_VARS.includes(key) && !key.startsWith('npm_')) {
            userEnv[key] = process.env[key]
        }
    }

    return userEnv
}

function writeEvent(payload, level = 'info') {
    let ev = {};
    if (typeof payload === 'string') ev.message = payload;
    else if (payload && typeof payload === 'object') ev = Object.assign({}, payload);
    else ev.message = String(payload);
    ev.ts = Date.now();
    ev.level = ev.level || level;
    try {
        console.log(JSON.stringify(ev));
    } catch (e) {
        console.log(String(ev.message || ev));
    }
}

function hasBuildScript(dir) {
    const pkgPath = path.join(dir, 'package.json')
    if (!fs.existsSync(pkgPath)) return false
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
        return pkg.scripts && pkg.scripts.build
    } catch (e) {
        return false
    }
}

function findBuildOutput(dir) {
    const candidates = ['dist', 'build', 'public', 'out']
    for (const c of candidates) {
        const p = path.join(dir, c)
        if (fs.existsSync(p) && fs.lstatSync(p).isDirectory()) return p
    }
    return null
}

function walkDir(dir) {
    const files = []
    function walk(current) {
        const items = fs.readdirSync(current)
        for (const item of items) {
            const full = path.join(current, item)
            const stat = fs.lstatSync(full)
            if (stat.isDirectory()) {
                if (item === 'node_modules') continue
                walk(full)
            } else if (stat.isFile()) {
                files.push(full)
            }
        }
    }
    walk(dir)
    return files
}

async function findProjectRoot(startDir) {
    const buildRoot = process.env.BUILD_ROOT
    if (buildRoot) {
        const customPath = path.join(startDir, buildRoot)
        if (fs.existsSync(customPath) && fs.lstatSync(customPath).isDirectory()) {
            writeEvent(`Using custom BUILD_ROOT: ${buildRoot}`)
            return customPath
        }
        writeEvent(`Warning: Custom BUILD_ROOT path not found: ${buildRoot}. Falling back to root directory.`, 'warn')
    }

    return startDir
}

function createEnvFile(projectRoot) {
    try {
        const userEnv = getUserEnvironmentVariables()
        const envVars = Object.keys(userEnv)

        if (envVars.length === 0) {
            writeEvent('ℹ️ No environment variables provided by user')
            return
        }

        const envContent = envVars
            .map(key => {
                const value = userEnv[key]
                // Escape quotes and handle multiline values
                const escapedValue = value.replace(/"/g, '\\"').replace(/\n/g, '\\n')
                return `${key}="${escapedValue}"`
            })
            .join('\n')

        const envPath = path.join(projectRoot, '.env')

        // Always overwrite .env file with latest user-provided environment variables
        fs.writeFileSync(envPath, envContent, 'utf8')
        writeEvent(`✅ Created/Updated .env file at ${envPath} with ${envVars.length} environment variable(s)`)

    } catch (err) {
        writeEvent({
            message: '❌ Error: Could not create/update .env file',
            error: err?.message ?? String(err)
        }, 'error')
        throw err
    }
}

async function init() {
    writeEvent('Executing script.js')

    if (!process.env.GITHUB_TOKEN) {
        writeEvent('Info: GITHUB_TOKEN not provided. Public repositories will work, but private repository access will fail.', 'warn')
    }

    const outDirPath = path.join(__dirname, 'output')
    const projectRoot = await findProjectRoot(outDirPath)

    let distFolderPath = null

    try {
        if (hasBuildScript(projectRoot)) {
            writeEvent('Build script found. Starting build process.');

            createEnvFile(projectRoot)

            const installCmd = process.env.INSTALL_CMD || 'npm install'
            const buildCmd = process.env.BUILD_CMD || 'npm run build'

            writeEvent(`Running: ${installCmd} && ${buildCmd}`)
            const p = exec(`cd ${projectRoot} && ${installCmd} && ${buildCmd}`)

            p.stdout.on('data', function (data) {
                writeEvent({ stream: 'stdout', message: data.toString() })
            })
            p.stderr && p.stderr.on && p.stderr.on('data', function (data) {
                writeEvent({ stream: 'stderr', message: data.toString() }, 'error')
            })

            try {
                await new Promise((resolve, reject) => {
                    p.on('close', (code) => {
                        if (code === 0) return resolve()
                        return reject(new Error(`Build process failed with exit code ${code}`))
                    })
                })
            } catch (buildErr) {
                writeEvent({ message: 'Build failed', error: buildErr?.message ?? String(buildErr) }, 'error')
                throw buildErr
            }

            writeEvent('Build Complete')
            distFolderPath = findBuildOutput(projectRoot) || path.join(projectRoot, 'dist')
        } else {
            writeEvent('No build script found — treating project as static (HTML/CSS/JS). Uploading output/ contents directly.')
            distFolderPath = projectRoot
        }
    } catch (err) {
        writeEvent({ message: 'Fatal error during build', error: err?.message ?? String(err) }, 'error')
        process.exit(1)
    }

    if (!fs.existsSync(distFolderPath) || !fs.lstatSync(distFolderPath).isDirectory()) {
        writeEvent({ message: 'Output folder not found', path: distFolderPath }, 'error')
        process.exit(1)
    }

    try {
        const files = walkDir(distFolderPath)

        for (const filePath of files) {
            const relativePath = path.relative(distFolderPath, filePath).replace(/\\/g, '/')
            if (!relativePath) continue

            writeEvent({ event: 'uploading', file: filePath })

            const contentType = mime.lookup(filePath) || 'application/octet-stream'

            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: `__outputs/${PROJECT_ID}/${relativePath}`,
                Body: fs.createReadStream(filePath),
                ContentType: contentType
            })

            if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
                writeEvent({ event: 'dry-run', key: command.input.Key })
            } else {
                await s3Client.send(command)
                writeEvent({ event: 'uploaded', file: filePath })
            }
        }
    } catch (err) {
        writeEvent({ message: 'Error reading folder', error: err?.message ?? String(err) }, 'error')
        process.exit(1)
    }

    writeEvent('Done...')
    process.exit(0)
}

init().catch((err) => {
    writeEvent({ message: 'Unhandled error', error: err?.message ?? String(err) }, 'error')
    process.exit(1)
})