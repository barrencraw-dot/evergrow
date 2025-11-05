#!/usr/bin/env node
import { createServer } from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { cwd } from 'node:process';

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 4173;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = resolve(cwd(), 'EverGrow/app');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mid': 'audio/midi',
};

const FALLBACK = 'index.html';

const resolvePath = (urlPath) => {
    const decoded = decodeURIComponent(urlPath.split('?')[0]);
    const normalized = normalize(decoded).replace(/^\/+/, '');
    if (normalized.startsWith('..')) {
        return PUBLIC_DIR;
    }
    return join(PUBLIC_DIR, normalized);
};

const sendFile = async (res, filePath) => {
    const extension = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    createReadStream(filePath).pipe(res);
};

const server = createServer(async (req, res) => {
    if (!req.url) {
        res.writeHead(400);
        res.end('Bad Request');
        return;
    }

    let requestedPath = resolvePath(req.url);

    try {
        const fileStat = await stat(requestedPath);
        if (fileStat.isDirectory()) {
            requestedPath = join(requestedPath, 'index.html');
            await stat(requestedPath);
        }
        await sendFile(res, requestedPath);
    } catch (error) {
        try {
            const fallbackPath = join(PUBLIC_DIR, FALLBACK);
            await stat(fallbackPath);
            await sendFile(res, fallbackPath);
        } catch (fallbackError) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not Found');
        }
    }
});

server.listen(PORT, HOST, () => {
    console.log(`EverGrow frontend available at http://${HOST}:${PORT}`);
    console.log(`Serving static files from ${PUBLIC_DIR}`);
});
