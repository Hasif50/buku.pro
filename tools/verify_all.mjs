#!/usr/bin/env node
// Site-wide verification battery for buku.pro.
// Usage: node tools/verify_all.mjs [--port 4173 | --base-url URL] [--out DIR]
// Writes report.json + summary.md to --out. Exit 0 clean, 1 any error-class
// failure, 2 inconclusive (browser stack unavailable).

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PAGES = [
  'index.html', 'bukubiz.html', 'bukubiz-admin.html', 'bukubiz-finance.html',
  'bukubiz-hr.html', 'bukubiz-marketing.html', 'bukubiz-operations.html',
  'bukubiz-sales.html', 'dentalos.html', 'mybuku.html',
  'blog/index.html', 'blog/buku-pro-suite.html',
  'blog/family-budgeting-malaysia.html', 'blog/myr-expense-tracker-malaysia.html',
];

const VIEWPORTS = [390, 320];

// Mojibake classes, as the bytes actually appear in the HTML files (verified
// by codepoint dump at f59a016). These are the ground-truth gate classes.
const MOJIBAKE_CLASSES = [
  { name: 'em-dash', re: /\u00E2\u20AC\u201D/g },
  { name: 'middot', re: /\u00C2\u00B7/g },
  { name: 'times', re: /\u00C3\u2014/g },
  { name: 'divide', re: /\u00C3\u00B7/g },
  { name: 'replacement-char', re: /\uFFFD/g },
];
// Other double-encoded sequences (arrows, quotes, degree signs) present in
// the files but outside the ground-truth class list. Informational only.
const MOJIBAKE_OTHER_RE = /\u00E2\u2020[\u2019\u201D]|\u00E2\u2013[\u00B0-\u00BF]|\u00E2\u20AC[\u2018\u2019\u201C\u201A\u201E\u2020\u2021\u02C6\u2030\u2013\u2026]/g;

function parseArgs(argv) {
  const args = { port: 4173, out: null, baseUrl: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--port') args.port = Number(argv[++i]);
    else if (argv[i] === '--base-url') args.baseUrl = argv[++i].replace(/\/+$/, '');
    else if (argv[i] === '--out') args.out = path.resolve(argv[++i]);
    else if (argv[i] === '--help' || argv[i] === '-h') args.help = true;
  }
  if (!args.out) args.out = path.join(REPO, 'orchestrate', 'evidence', 'run-' + new Date().toISOString().replace(/[:.]/g, '-'));
  if (!args.baseUrl) args.baseUrl = `http://127.0.0.1:${args.port}`;
  return args;
}

function gitHead() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO }).toString().trim();
  } catch {
    return null;
  }
}

async function loadPlaywright() {
  const url = 'file:///C:/Users/hashi/AppData/Roaming/npm/node_modules/playwright/index.mjs';
  try {
    return await import(url);
  } catch (err) {
    console.error(`INCONCLUSIVE: cannot import playwright from ${url} (${err.message})`);
    process.exit(2);
  }
}

function countMatches(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

async function staticChecks(failures) {
  const mojibake = {};
  const mojibakeOther = {};
  const emdash = {};
  const mdashEntity = {};
  const ndashEntity = {};
  const links = { checked: 0, broken: [] };
  const headMeta = {};

  for (const page of PAGES) {
    const file = path.join(REPO, page);
    if (!existsSync(file)) {
      failures.push({ check: 'file-exists', page, detail: 'page file missing on disk' });
      continue;
    }
    const html = await readFile(file, 'utf8');

    mojibake[page] = MOJIBAKE_CLASSES.reduce((n, c) => n + countMatches(html, c.re), 0);
    if (mojibake[page] > 0) {
      failures.push({ check: 'mojibake', page, detail: `${mojibake[page]} mojibake sequence(s)` });
    }
    mojibakeOther[page] = countMatches(html, MOJIBAKE_OTHER_RE);

    // Raw U+2014 census. It intentionally counts the U+2014 inside the
    // mojibake sequence U+00C3 U+2014, matching the ground-truth scan.
    emdash[page] = countMatches(html, /\u2014/g);
    if (emdash[page] > 0) {
      failures.push({ check: 'em-dash', page, detail: `${emdash[page]} U+2014 occurrence(s) (order 4: none allowed)` });
    }

    // Entity spellings render as em-dashes in the browser and are invisible
    // to the raw U+2014 census above, so they get their own error class.
    // &ndash; is allowed by the brand rules: informational only, never gating.
    mdashEntity[page] = countMatches(html, /&(?:mdash|#0*8212|#x0*2014);?/gi);
    if (mdashEntity[page] > 0) {
      failures.push({ check: 'mdash-entity', page, detail: `${mdashEntity[page]} em-dash entity occurrence(s) (order 4: none allowed)` });
    }
    ndashEntity[page] = countMatches(html, /&(?:ndash|#0*8211|#x0*2013);?/gi);

    const dir = path.posix.dirname(page);
    const attrRe = /\b(href|src)\s*=\s*"([^"]*)"/gi;
    for (const match of html.matchAll(attrRe)) {
      const raw = match[2].trim();
      if (!raw || raw.startsWith('#')) continue;
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw) || raw.startsWith('//')) continue;
      let target = raw.split('#')[0].split('?')[0];
      if (!target) continue;
      const resolved = target.startsWith('/')
        ? path.posix.normalize(target.slice(1))
        : path.posix.normalize(path.posix.join(dir === '.' ? '' : dir, target));
      const candidates = resolved.endsWith('/') || !path.posix.extname(resolved)
        ? [resolved, resolved + '.html', resolved + '/index.html']
        : [resolved];
      links.checked++;
      if (!candidates.some((c) => c && existsSync(path.join(REPO, c)))) {
        links.broken.push({ page, attr: match[1], target: raw, tried: candidates });
        failures.push({ check: 'broken-link', page, detail: `${match[1]}="${raw}" resolves to none of: ${candidates.join(', ')}` });
      }
    }

    const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
    const descTag = metaTags.find((t) => /\bname\s*=\s*["']description["']/i.test(t));
    const descContent = descTag && (descTag.match(/\bcontent\s*=\s*["']([^"']*)["']/i) || [])[1];
    const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1];
    const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
    const canonTag = linkTags.find((t) => /\brel\s*=\s*["']canonical["']/i.test(t));
    const canonHref = canonTag && (canonTag.match(/\bhref\s*=\s*["']([^"']*)["']/i) || [])[1];
    headMeta[page] = {
      title: Boolean(title && title.trim()),
      description: Boolean(descContent && descContent.trim()),
      canonical: Boolean(canonHref && canonHref.trim()),
    };
    for (const k of ['title', 'description', 'canonical']) {
      if (!headMeta[page][k]) {
        failures.push({ check: 'head-meta', page, detail: `missing or empty <${k}>` });
      }
    }
  }

  const sitemapPath = path.join(REPO, 'sitemap.xml');
  const sitemap = { urls: 0, mapped: 0, unmapped: [] };
  if (existsSync(sitemapPath)) {
    const xml = await readFile(sitemapPath, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      sitemap.urls++;
      const pathname = new URL(m[1].trim()).pathname.replace(/\/+$/, '');
      const rel = pathname === '' ? 'index.html' : pathname.replace(/^\//, '');
      const candidates = [rel, rel + '.html', rel + '/index.html'];
      if (candidates.some((c) => existsSync(path.join(REPO, c)))) sitemap.mapped++;
      else {
        sitemap.unmapped.push({ url: m[1].trim(), tried: candidates });
        failures.push({ check: 'sitemap', page: 'sitemap.xml', detail: `${m[1].trim()} maps to none of: ${candidates.join(', ')}` });
      }
    }
  } else {
    failures.push({ check: 'sitemap', page: 'sitemap.xml', detail: 'sitemap.xml missing' });
  }

  return { mojibake, mojibakeOther, emdash, mdashEntity, ndashEntity, links, sitemap, headMeta };
}

async function browserChecks(baseUrl, outDir, failures) {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const pages = {};
  const evidencePair = { 'index.html': 390, 'bukubiz-finance.html': 320 };
  const slug = (p) => p.replace(/[/.]/g, '-');
  const shots = [];

  for (const width of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    for (const pagePath of PAGES) {
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', (err) => pageErrors.push(String(err)));
      const url = `${baseUrl}/${pagePath}`;
      const started = Date.now();
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 20000 });
      } catch (err) {
        pageErrors.push(`goto failed: ${err.message.split('\n')[0]}`);
      }
      let dims = { docScroll: null, docClient: null, bodyScroll: null, bodyClient: null };
      try {
        dims = await page.evaluate(() => {
          const d = document.documentElement;
          const b = document.body;
          return { docScroll: d.scrollWidth, docClient: d.clientWidth, bodyScroll: b ? b.scrollWidth : null, bodyClient: b ? b.clientWidth : null };
        });
      } catch { /* page never loaded; dims stay null */ }
      const overflow = (dims.docScroll !== null && dims.docScroll > dims.docClient) ||
        (dims.bodyScroll !== null && dims.bodyScroll > dims.bodyClient);
      const failed = consoleErrors.length > 0 || pageErrors.length > 0 || overflow;
      let screenshot = null;
      if (failed || evidencePair[pagePath] === width) {
        screenshot = path.join(outDir, `${slug(pagePath)}-${width}.png`);
        try {
          await page.screenshot({ path: screenshot, fullPage: true });
          shots.push(screenshot);
        } catch {
          screenshot = null;
        }
      }
      for (const text of consoleErrors) failures.push({ check: 'console-error', page: `${pagePath}@${width}`, detail: text });
      for (const text of pageErrors) failures.push({ check: 'page-error', page: `${pagePath}@${width}`, detail: text });
      if (overflow) {
        failures.push({ check: 'overflow', page: `${pagePath}@${width}`, detail: `scrollWidth ${Math.max(dims.docScroll ?? 0, dims.bodyScroll ?? 0)} > clientWidth ${dims.docClient}` });
      }
      pages[pagePath] = pages[pagePath] || {};
      pages[pagePath][width] = {
        url, consoleErrors, pageErrors, overflow, dims, ok: !failed, screenshot,
        loadMs: Date.now() - started,
      };
      await page.close();
    }
    await context.close();
  }
  await browser.close();
  return { pages, screenshots: shots };
}

function table(rows) {
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => String(r[i]).length)));
  return rows.map((r) => r.map((c, i) => String(c).padEnd(widths[i])).join('  ')).join('\n');
}

function renderSummary(report) {
  const lines = [];
  lines.push('# buku.pro verification battery');
  lines.push('');
  lines.push(`- Run: ${report.meta.generatedAt}`);
  lines.push(`- HEAD: ${report.meta.head ?? 'unknown'}`);
  lines.push(`- Base URL: ${report.meta.baseUrl}`);
  lines.push(`- Verdict: ${report.totals.ok ? 'PASS' : `FAIL (${report.totals.failures} error-class finding(s))`}`);
  lines.push('');
  lines.push('## Browser checks (console errors, page errors, horizontal overflow)');
  lines.push('');
  const rows = [['page', 'viewport', 'console errors', 'page errors', 'overflow', 'ok']];
  for (const p of PAGES) {
    for (const w of VIEWPORTS) {
      const r = report.browser.pages[p]?.[w];
      if (!r) continue;
      rows.push([p, w, r.consoleErrors.length, r.pageErrors.length, r.overflow ? `yes (${Math.max(r.dims.docScroll, r.dims.bodyScroll)}>${r.dims.docClient})` : 'no', r.ok ? 'yes' : 'NO']);
    }
  }
  lines.push('```');
  lines.push(table(rows));
  lines.push('```');
  lines.push('');
  lines.push('## Static checks');
  lines.push('');
  lines.push('Mojibake sequences per file (classes: double-encoded em-dash, middot, times, divide, U+FFFD). Error-class when > 0.');
  lines.push('');
  lines.push('```');
  lines.push(table([['page', 'mojibake', 'other mojibake-like (info only)', 'em-dash U+2014 (raw census)', 'mdash entity (error)', 'ndash entity (info)']]
    .concat(PAGES.map((p) => [p, report.static.mojibake[p] ?? '-', report.static.mojibakeOther?.[p] ?? '-', report.static.emdash[p] ?? '-', report.static.mdashEntity?.[p] ?? '-', report.static.ndashEntity?.[p] ?? '-']))));
  lines.push('```');
  lines.push('');
  lines.push(`Totals: mojibake ${report.totals.mojibake}, em-dash ${report.totals.emdash}, mdash entity ${report.totals.mdashEntity}, ndash entity ${report.totals.ndashEntity} (info). The em-dash figure is a raw U+2014 census and includes the U+2014 inside the mojibake sequence U+00C3 U+2014 (visible in bukubiz-hr and bukubiz-sales counts). The mdash-entity figure counts &mdash;/&#8212;/&#x2014; spellings that render as em-dashes but evade the raw census.`);
  lines.push('');
  lines.push('Note: headless Chromium does not fetch /favicon.ico, so console errors here are real failed resource loads, not favicon noise.');
  lines.push('');
  lines.push('## Broken internal links');
  lines.push('');
  if (report.static.links.broken.length === 0) lines.push('None.');
  for (const b of report.static.links.broken) lines.push(`- ${b.page}: ${b.attr}="${b.target}" (tried ${b.tried.join(', ')})`);
  lines.push('');
  lines.push(`Internal href/src targets checked: ${report.static.links.checked}`);
  lines.push('');
  lines.push('## Sitemap');
  lines.push('');
  lines.push(`${report.static.sitemap.mapped}/${report.static.sitemap.urls} sitemap URLs map to a file on disk.`);
  for (const u of report.static.sitemap.unmapped) lines.push(`- UNMAPPED ${u.url} (tried ${u.tried.join(', ')})`);
  lines.push('');
  lines.push('## Head metadata');
  lines.push('');
  lines.push('```');
  lines.push(table([['page', 'title', 'description', 'canonical']]
    .concat(PAGES.map((p) => {
      const h = report.static.headMeta[p] || {};
      return [p, h.title ? 'yes' : 'MISSING', h.description ? 'yes' : 'MISSING', h.canonical ? 'yes' : 'MISSING'];
    }))));
  lines.push('```');
  lines.push('');
  lines.push('## Failure ledger');
  lines.push('');
  for (const f of report.failures) lines.push(`- [${f.check}] ${f.page}: ${f.detail}`);
  if (report.failures.length === 0) lines.push('None.');
  lines.push('');
  return lines.join('\n');
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log('Usage: node tools/verify_all.mjs [--port 4173 | --base-url URL] [--out DIR]');
  process.exit(0);
}

const failures = [];
const staticResults = await staticChecks(failures);
const browserResults = await browserChecks(args.baseUrl, args.out, failures).catch((err) => {
  console.error(`INCONCLUSIVE: browser checks failed to run (${err.message})`);
  console.error(`Static checks did run; failures so far: ${failures.length}`);
  process.exit(2);
});

const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
const report = {
  meta: {
    generatedAt: new Date().toISOString(),
    head: gitHead(),
    baseUrl: args.baseUrl,
    node: process.version,
    viewports: VIEWPORTS,
    pages: PAGES,
  },
  browser: browserResults,
  static: staticResults,
  failures,
  totals: {
    mojibake: sum(staticResults.mojibake),
    emdash: sum(staticResults.emdash),
    mdashEntity: sum(staticResults.mdashEntity),
    ndashEntity: sum(staticResults.ndashEntity),
    brokenLinks: staticResults.links.broken.length,
    consoleErrors: sum(Object.fromEntries(PAGES.map((p) => [p, VIEWPORTS.reduce((a, w) => a + (browserResults.pages[p]?.[w]?.consoleErrors.length ?? 0), 0)]))),
    pageErrors: sum(Object.fromEntries(PAGES.map((p) => [p, VIEWPORTS.reduce((a, w) => a + (browserResults.pages[p]?.[w]?.pageErrors.length ?? 0), 0)]))),
    overflowCombos: PAGES.reduce((a, p) => a + VIEWPORTS.filter((w) => browserResults.pages[p]?.[w]?.overflow).length, 0),
    failures: failures.length,
    ok: failures.length === 0,
  },
};

await mkdir(args.out, { recursive: true });
const jsonPath = path.join(args.out, 'report.json');
const mdPath = path.join(args.out, 'summary.md');
await writeFile(jsonPath, JSON.stringify(report, null, 2) + '\n');
await writeFile(mdPath, renderSummary(report));

console.log(`report: ${jsonPath}`);
console.log(`summary: ${mdPath}`);
console.log(`screenshots: ${browserResults.screenshots.length}`);
console.log(`verdict: ${report.totals.ok ? 'PASS' : 'FAIL'} (${report.totals.failures} finding(s): mojibake ${report.totals.mojibake}, em-dash ${report.totals.emdash}, mdash entities ${report.totals.mdashEntity}, broken links ${report.totals.brokenLinks}, console errors ${report.totals.consoleErrors}, page errors ${report.totals.pageErrors}, overflow combos ${report.totals.overflowCombos})`);
process.exitCode = report.totals.ok ? 0 : 1;
