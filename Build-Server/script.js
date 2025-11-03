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

async function init() {
    writeEvent('Executing script.js')

    if (!process.env.GITHUB_TOKEN) {
        writeEvent('Warning: GITHUB_TOKEN is not provided. If the repository is private, authentication will fail.', 'warn')
    }

    const outDirPath = path.join(__dirname, 'output')

    let distFolderPath = null

    if (hasBuildScript(outDirPath)) {
        writeEvent('Detected build script. Running npm install && npm run build in output folder...')
        const p = exec(`cd ${outDirPath} && npm install && npm run build`)

        p.stdout.on('data', function (data) {
            writeEvent({ stream: 'stdout', message: data.toString() })
        })
        p.stderr && p.stderr.on && p.stderr.on('data', function (data) {
            writeEvent({ stream: 'stderr', message: data.toString() }, 'error')
        })

        await new Promise((resolve, reject) => {
            p.on('close', (code) => {
                if (code === 0) return resolve()
                return reject(new Error('Build process exited with code ' + code))
            })
        })

        writeEvent('Build Complete')
        distFolderPath = findBuildOutput(outDirPath) || path.join(outDirPath, 'dist')
    } else {
        writeEvent('No build script found — treating project as static (HTML/CSS/JS). Uploading output/ contents directly.')
        distFolderPath = outDirPath
    }

    if (!fs.existsSync(distFolderPath) || !fs.lstatSync(distFolderPath).isDirectory()) {
        writeEvent({ message: 'Output folder not found', path: distFolderPath }, 'error')
        return
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
    }

    writeEvent('Done...')
}

init()