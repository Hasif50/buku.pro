#!/usr/bin/env node
// Build a PUBLIC-ONLY staging directory for the Cloudflare Pages deploy.
//
// Why this exists: the legacy deploy-cloudflare.ps1 runs
// `npx wrangler pages deploy .` on the repo root. That was safe in August
// (pre-harness), but the working tree now also contains internal files that
// must never go public: orchestrate/ (ledgers, rulings), .mimosa/ (security
// scans), START-PROMPT.md, TASK-PROMPT.md, docs/ (incl.
// cloudflare-tokens-audit.md), .worktrees/. Deploying the root wholesale
// would publish all of them to buku.pro.
//
// Usage:
//   node tools/deploy_stage.mjs
//   npx wrangler pages deploy .deploy-stage --project-name buku-pro --branch main
//
// The staging dir is regenerated from scratch every run.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STAGE = path.join(ROOT, '.deploy-stage');

// Public site surface, explicitly enumerated. Anything not listed stays out.
const PUBLIC_FILES = [
  'CNAME', 'robots.txt', 'sitemap.xml', 'README.md', '.gitignore',
  'index.html', 'mybuku.html', 'bukubiz.html', 'dentalos.html',
  'bukubiz-admin.html', 'bukubiz-finance.html', 'bukubiz-hr.html',
  'bukubiz-marketing.html', 'bukubiz-operations.html', 'bukubiz-sales.html',
  'privacy.html', 'terms.html',
];
const PUBLIC_DIRS = ['assets', 'blog', 'functions', 'tools'];

fs.rmSync(STAGE, { recursive: true, force: true });
fs.mkdirSync(STAGE, { recursive: true });

let count = 0;
for (const f of PUBLIC_FILES) {
  const src = path.join(ROOT, f);
  if (!fs.existsSync(src)) { console.error('missing public file:', f); process.exit(1); }
  fs.copyFileSync(src, path.join(STAGE, f));
  count++;
}
for (const d of PUBLIC_DIRS) {
  const src = path.join(ROOT, d);
  if (!fs.existsSync(src)) { console.error('missing public dir:', d); process.exit(1); }
  fs.cpSync(src, path.join(STAGE, d), { recursive: true });
  count++;
}

console.log('staged', count, 'public files/dirs into', '.deploy-stage/');
console.log('next: npx wrangler pages deploy .deploy-stage --project-name buku-pro --branch main');
