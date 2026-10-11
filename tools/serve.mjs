#!/usr/bin/env node
// Zero-dependency static server for the buku.pro repo root.
// Usage: node tools/serve.mjs [--port 4173] [--root DIR]
// Serves /x from x.html (GitHub Pages convention) and dir/ from dir/index.html.

import { createServer } from 'node:http';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(scriptDir, '..');

function parseArgs(argv) {
  const args = { port: 4173, root: defaultRoot };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--port') args.port = Number(argv[++i]);
    else if (argv[i] === '--root') args.root = path.resolve(argv[++i]);
    else if (argv[i] === '--help' || argv[i] === '-h') args.help = true;
  }
  if (!Number.isInteger(args.port) || args.port < 1 || args.port > 65535) {
    throw new Error(`invalid --port: ${argv[argv.indexOf('--port') + 1]}`);
  }
  return args;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
};

async function resolveFile(rootPath, pathname) {
  const rel = path.posix.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  let candidate = path.join(rootPath, rel);
  if (!candidate.startsWith(rootPath)) return null;
  const tryPath = async (p) => {
    try {
      const s = await stat(p);
      if (s.isDirectory()) return path.join(p, 'index.html');
      return p;
    } catch {
      return null;
    }
  };
  if (pathname.endsWith('/')) return tryPath(path.join(candidate, 'index.html'));
  const direct = await tryPath(candidate);
  if (direct) return direct;
  if (!path.extname(candidate)) return tryPath(candidate + '.html');
  return null;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log('Usage: node tools/serve.mjs [--port 4173] [--root DIR]');
  process.exit(0);
}

const server = createServer(async (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  const file = await resolveFile(args.root, pathname);
  if (!file) {
    console.log(`${req.method} ${pathname} 404`);
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 not found: ' + pathname);
    return;
  }
  try {
    const body = await readFile(file);
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    console.log(`${req.method} ${pathname} 200`);
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': body.length });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (err) {
    console.log(`${req.method} ${pathname} 500 ${err.code}`);
    res.writeHead(500).end('server error');
  }
});

server.listen(args.port, '127.0.0.1', () => {
  console.log(`serving ${args.root} on http://127.0.0.1:${args.port}`);
});
