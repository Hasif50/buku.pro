#!/usr/bin/env node
// buku.pro SEO/OG package (Node port of the 2026-09-03 one-shot python tool).
// HISTORICAL one-shot: already applied to the site (OG tags shipped at f59a016).
// Do NOT run on the current tree without intent: the live sitemap.xml has since
// gained privacy/terms entries this script predates. The original og-image
// generation (PIL) was not ported; assets/og-image.png is committed.
// Usage: node tools/seo_package.mjs            (idempotent guards preserved)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// GUARDED: the embedded sitemap list predates the privacy/terms entries and the
// 2026-10-15 lastmod bumps. Running it on the current tree would regress
// sitemap.xml. Allowed only with an explicit override env flag.
if (process.env.ALLOW_SEO_REGEN !== 'I_UNDERSTAND_THIS_REWRITES_SITEMAP_AND_ROBOTS') {
  console.error('guard: this one-shot predates the current sitemap/robots; running it would regress them.');
  console.error('set ALLOW_SEO_REGEN=I_UNDERSTAND_THIS_REWRITES_SITEMAP_AND_ROBOTS to run anyway.');
  process.exit(2);
}

function repoPath(p) {
  const t = path.resolve(ROOT, p);
  if (t !== ROOT && !t.startsWith(ROOT + path.sep)) {
    throw new Error('refusing to touch paths outside the repo: ' + p);
  }
  return t;
}

// ---------- per-page OG/canonical meta injection ----------
const SITE = 'https://buku.pro';
const PAGES = {
  'index.html': ['/', 'buku.pro: AI that works for you',
    'buku.pro builds AI agents for the work behind every business. Finance, marketing, sales, and operations, handled for you.'],
  'mybuku.html': ['/mybuku', 'MyBuku: personal finance, MYR budgets, family & investments',
    'Track spending in Ringgit, budget together with family, watch investments, top up via ToyyibPay: the Malaysian money app from buku.pro.'],
  'bukubiz.html': ['/bukubiz', 'Bukubiz: six AI department agents for your business',
    'Finance, marketing, sales, operations, HR, and admin: standalone AI agents over a signed interconnect, from buku.pro.'],
  'dentalos.html': ['/dentalos', 'DentalOS AI: the Bukubiz usecase for dental clinics',
    'Scheduling, inventory, patient communication, and back-office: AI agents for dental clinics, from buku.pro.'],
  'blog/index.html': ['/blog', 'Blog: buku.pro',
    'Practical guides on tracking expenses, family budgeting, and investing in Malaysia: from the MyBuku team.'],
  'blog/myr-expense-tracker-malaysia.html': ['/blog/myr-expense-tracker-malaysia', 'The Best Way to Track Expenses in Malaysia (2026)',
    'A practical MYR expense-tracking guide: fast capture, sen-accurate budgets, and one view across spending, family, and investments.'],
  'blog/family-budgeting-malaysia.html': ['/blog/family-budgeting-malaysia', 'Family Budgeting in Malaysia: buku.pro',
    'Fixed, daily, and goal accounts; the Malaysian budget calendar; and investments in the same family book.'],
  'blog/buku-pro-suite.html': ['/blog/buku-pro-suite', 'One book, every agent: the buku.pro suite',
    'myBuku (Buku Lang, MyBuku BA) and Bukubiz (six agents, DentalOS AI): the whole shelf, one dashboard.'],
};

function inject(name, canonical, ogTitle, ogDesc) {
  const p = repoPath(name);
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('property="og:title"')) return 'already';
  const titleMatch = s.match(/<title>([^<]*)<\/title>/);
  const pageTitle = titleMatch ? titleMatch[1] : ogTitle;
  const meta = [
    `  <link rel="canonical" href="${SITE}${canonical}">`,
    `  <meta property="og:type" content="website">`,
    `  <meta property="og:site_name" content="buku.pro">`,
    `  <meta property="og:title" content="${pageTitle}">`,
    `  <meta property="og:description" content="${ogDesc}">`,
    `  <meta property="og:url" content="${SITE}${canonical}">`,
    `  <meta property="og:image" content="${SITE}/assets/og-image.png">`,
    `  <meta name="twitter:card" content="summary_large_image">`,
  ].join('\n') + '\n';
  s = s.replace(/(<meta name="viewport"[^>]*>)/, '$1\n' + meta);
  fs.writeFileSync(p, s);
  return 'injected';
}

for (const [name, [canonical, ogTitle, ogDesc]] of Object.entries(PAGES)) {
  console.log(name, '->', inject(name, canonical, ogTitle, ogDesc));
}

// department pages + remaining root pages: canonical + generic og (title reuse)
for (const f of fs.readdirSync(ROOT).filter((x) => x.endsWith('.html'))) {
  if (f in PAGES) continue;
  const canonical = '/' + f.replace('.html', '');
  const titleMatch = fs.readFileSync(repoPath(f), 'utf8').match(/<title>([^<]*)<\/title>/);
  const ogTitle = titleMatch ? titleMatch[1] : 'buku.pro';
  console.log(f, '->', inject(f, canonical, ogTitle, 'AI agents for the work behind every business, from buku.pro.'));
}

// ---------- sitemap + robots ----------
const urls = ['/', '/mybuku', '/bukubiz', '/dentalos', '/blog', '/blog/myr-expense-tracker-malaysia',
  '/blog/family-budgeting-malaysia', '/blog/buku-pro-suite'];
urls.push('/bukubiz-admin', '/bukubiz-finance', '/bukubiz-hr', '/bukubiz-marketing',
  '/bukubiz-operations', '/bukubiz-sales');
const today = '2026-09-03';
const sm = ['<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
for (const u of urls) sm.push(`  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`);
sm.push('</urlset>');
fs.writeFileSync(repoPath('sitemap.xml'), sm.join('\n') + '\n');

fs.writeFileSync(repoPath('robots.txt'),
  'User-agent: *\nAllow: /\n\nSitemap: https://buku.pro/sitemap.xml\n');
console.log('robots.txt + sitemap.xml written:', urls.length, 'urls');
