#!/usr/bin/env node
// buku.pro one-shot site edits (Node port of the historical python tool).
// HISTORICAL one-shot: already applied to the site. Idempotence guards are
// preserved, so a run on the current tree is a no-op.
// Usage: node tools/site_edits.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function repoPath(p) {
  const t = path.resolve(ROOT, p);
  if (t !== ROOT && !t.startsWith(ROOT + path.sep)) {
    throw new Error('refusing to touch paths outside the repo: ' + p);
  }
  return t;
}

// ---------- 1. Nav removal + footer Blog link on every page ----------
const files = fs.readdirSync(ROOT).filter((x) => x.endsWith('.html'))
  .concat(fs.readdirSync(path.join(ROOT, 'blog')).map((x) => 'blog/' + x).filter((x) => x.endsWith('.html')));
for (const f of files) {
  const p = repoPath(f);
  let s = fs.readFileSync(p, 'utf8');
  const orig = s;
  // remove Blog from header nav (with its newline)
  s = s.replace('        <a href="blog/index.html">Blog</a>\n', '');
  // add Blog to footer Company column
  if (!s.includes('<a href="blog/index.html">Blog</a>')) {
    s = s.replace('<h3>Company</h3>', '<h3>Company</h3>\n          <a href="blog/index.html">Blog</a>');
  }
  if (s !== orig) {
    fs.writeFileSync(p, s);
    console.log('nav/footer updated:', f);
  }
}

// ---------- 2. mybuku.html usecases section ----------
{
  const p = repoPath('mybuku.html');
  let s = fs.readFileSync(p, 'utf8');
  if (!s.includes('Buku Lang')) {
    const usecases = `
    <section class="section section-soft">
      <div class="container">
        <div class="section-head">
          <span class="running-head"><span class="folio">03</span>Chapter &middot; Use cases</span>
          <h2 class="h2 ink">One personal-finance engine, two use cases</h2>
          <p class="lead">MyBuku's money engine powers purpose-built experiences under the same book.</p>
        </div>
        <div class="features features--2">
          <div class="feature reveal">
            <div class="f-icon">UC-1</div>
            <h3>MyBuku BA &mdash; live</h3>
            <p>The Beauty Advisor AI Assistant: sales tracking, CRM, a knowledge base that answers from your own documents, WhatsApp agent, and credit billing. Delivered and running for KENS Apothecary.</p>
            <p style="margin-top:14px;"><a class="btn btn-primary" href="https://ba.buku.pro">Open MyBuku BA &rarr;</a></p>
          </div>
          <div class="feature reveal">
            <div class="f-icon">UC-2</div>
            <h3>Buku Lang &mdash; beta</h3>
            <p>The Mandarin Retail Coach: a 14-day agentic language beta that teaches beauty advisors service Mandarin with mission loops, SRS review, roleplay, and an AI tutor double-checked by a second model.</p>
            <p style="margin-top:14px;"><a class="btn btn-primary" href="#get-started">Join the beta waitlist &rarr;</a></p>
          </div>
        </div>
      </div>
    </section>
`;
    const anchor = '    <section class="section" id="get-started">';
    s = s.replace(anchor, usecases + '\n' + anchor);
    fs.writeFileSync(p, s);
    console.log('mybuku.html usecases added');
  } else {
    console.log('mybuku.html usecases already present');
  }
}
