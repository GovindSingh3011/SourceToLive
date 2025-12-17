const express = require('express')
const httpProxy = require('http-proxy')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 8000
const BASE_PATH = process.env.BASE_PATH
const CLIENT_URL = process.env.CLIENT_URL || 'https://sourcetolive.dev'

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
    
    proxyRes.on('data', function(chunk) {
        body.push(chunk);
    });
    
    proxyRes.on('end', function() {
        body = Buffer.concat(body).toString();
        
        if (body.includes('<Code>AccessDenied</Code>') || body.includes('<Code>NoSuchKey</Code>')) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(custom404Page);
        } else {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            res.end(body);
        }
    });
});

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