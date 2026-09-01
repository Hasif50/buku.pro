import glob, re

# ---------- 1. Nav removal + footer Blog link on every page ----------
for f in glob.glob('*.html') + glob.glob('blog/*.html'):
    s = open(f, encoding='utf-8').read()
    orig = s
    # remove Blog from header nav (with its newline)
    s = s.replace('        <a href="blog/index.html">Blog</a>\n', '')
    # add Blog to footer Company column
    if '<a href="blog/index.html">Blog</a>' not in s:
        s = s.replace('<h3>Company</h3>', '<h3>Company</h3>\n          <a href="blog/index.html">Blog</a>', 1)
    if s != orig:
        open(f, 'w', encoding='utf-8', newline='\n').write(s)
        print('nav/footer updated:', f)

# ---------- 2. mybuku.html usecases section ----------
s = open('mybuku.html', encoding='utf-8').read()
if 'Buku Lang' not in s:
    usecases = '''
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
'''
    anchor = '    <section class="section" id="get-started">'
    s = s.replace(anchor, usecases + '\n' + anchor, 1)
    open('mybuku.html', 'w', encoding='utf-8', newline='\n').write(s)
    print('mybuku.html usecases added')
else:
    print('mybuku.html usecases already present')
