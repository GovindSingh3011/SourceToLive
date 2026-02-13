const express = require('express')
const httpProxy = require('http-proxy')
const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const url = require('url')
const AWS = require('aws-sdk')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 8000
const BASE_PATH = process.env.BASE_PATH
const CLIENT_URL = process.env.CLIENT_URL || 'https://sourcetolive.dev'

// Configure AWS SDK if credentials are available
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
    })
}

const s3 = new AWS.S3()
const proxy = httpProxy.createProxy()

const custom404Template = fs.readFileSync(path.join(__dirname, '404.html'), 'utf8')
const custom404Page = custom404Template.replace(/{{CLIENT_URL}}/g, CLIENT_URL)

app.use((req, res) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    if (subdomain === 'www' || subdomain === hostname) {
        console.log('Redirecting to main website from:', hostname);
        return res.redirect(301, CLIENT_URL);
    }

    const resolvesTo = `${BASE_PATH}/${subdomain}`;

    console.log('Hostname:', hostname);
    console.log('Subdomain:', subdomain);
    console.log('Proxying request to:', resolvesTo);

    proxy.web(req, res, { target: resolvesTo, changeOrigin: true, selfHandleResponse: true });
});

proxy.on('proxyRes', (proxyRes, req, res) => {
    let body = [];

    proxyRes.on('data', function (chunk) {
        body.push(chunk);
    });

    proxyRes.on('end', function () {
        body = Buffer.concat(body).toString();

        const isS3Error = body.includes('<Code>AccessDenied</Code>') || body.includes('<Code>NoSuchKey</Code>') || body.includes('AccessDenied');

        // Check if this is a static asset (has file extension)
        const isStaticAsset = /\.[a-zA-Z0-9]+$/i.test(req.url);

        // Treat 403, 404, and S3 errors the same way
        if (isS3Error || proxyRes.statusCode === 403 || proxyRes.statusCode === 404) {
            // If it's a static asset with a file extension, return silent 404
            if (isStaticAsset) {
                console.log('Static asset not found:', req.url, '| Status:', proxyRes.statusCode);
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not Found' }));
                return;
            }

            // For routes without file extensions, fallback to index.html for SPA routing
            console.log('Access error on:', req.url, '| Trying with AWS SDK');
            const subdomain = req.hostname.split('.')[0];

            // Try to fetch index.html using S3 SDK if credentials exist
            if (process.env.AWS_ACCESS_KEY_ID) {
                fetchFromS3(subdomain, '/index.html', res);
                return;
            }

            // Fallback to HTTP request
            const resolvesTo = `${BASE_PATH}/${subdomain}`;
            const indexUrl = url.resolve(resolvesTo, '/index.html');
            const protocol = resolvesTo.startsWith('https') ? https : http;

            const indexReq = protocol.get(indexUrl, (indexRes) => {
                let indexBody = [];
                indexRes.on('data', (chunk) => indexBody.push(chunk));
                indexRes.on('end', () => {
                    if (indexRes.statusCode === 200) {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(Buffer.concat(indexBody));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(custom404Page);
                    }
                });
            });

            indexReq.on('error', (err) => {
                console.error('Error fetching index.html:', err.message);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(custom404Page);
            });
            return;
        }

        // Success response
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        res.end(body);
    });
});

// Function to fetch file from S3 using AWS SDK
function fetchFromS3(subdomain, filePath, res) {
    const bucket = 'sourcetolivebucket';
    const key = `__outputs/${subdomain}${filePath}`;

    console.log(`Fetching from S3: s3://${bucket}/${key}`);

    const params = {
        Bucket: bucket,
        Key: key
    };

    s3.getObject(params, (err, data) => {
        if (err) {
            console.error('S3 Error:', err.code, '-', err.message);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(custom404Page);
            return;
        }

        console.log('Successfully fetched from S3:', key);
        const contentType = data.ContentType || 'text/html';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data.Body);
    });
}

proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if (url === '/')
        proxyReq.path += 'index.html';
});

proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(custom404Page);
});

app.listen(PORT, () => console.log(`Reverse Proxy Running on port ${PORT}`))