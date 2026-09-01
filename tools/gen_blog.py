import glob

src = open('index.html', encoding='utf-8').read()
head = src[:src.index('</head>')+7]
header = src[src.index('<header class="nav">'):src.index('</header>')+9]
footer = src[src.index('<footer class="footer">'):]
footer = footer[:footer.index('</footer>')+9]
scripts = '\n  <script src="assets/js/main.js"></script>\n  <script src="assets/js/waitlist.js" defer></script>'

def page(title, desc, body, waitlist_product=None):
    h = head.replace('<title>buku.pro — AI that works for you</title>', '<title>' + title + '</title>')
    h = h.replace('buku.pro builds AI agents for the work behind every business. Finance, marketing, sales, and operations, handled for you.', desc)
    form = ''
    if waitlist_product:
        form = ('\n    <section class="section" id="get-started">\n      <div class="container">\n'
                '        <div class="cta-band reveal">\n          <div>\n'
                '            <span class="running-head"><span class="folio">\u00b6</span>Join the book</span>\n'
                '            <h2>Get the app while the doors are open.</h2>\n'
                '            <p>Join the waitlist and be first in when myBuku opens wider.</p>\n'
                '          </div>\n'
                '          <form class="waitlist-form" data-product="' + waitlist_product + '" novalidate>\n'
                '            <input type="text" name="website" class="wl-hp" tabindex="-1" autocomplete="off" aria-hidden="true">\n'
                '            <div class="wl-row">\n'
                '              <input type="email" name="email" class="wl-email" placeholder="you@example.com" required autocomplete="email">\n'
                '              <button type="submit" class="btn btn-primary btn-lg">Join waitlist</button>\n'
                '            </div>\n'
                '            <label class="wl-consent"><input type="checkbox" name="consent" required> I agree to be contacted about myBuku updates (PDPA 2010). Unsubscribe anytime.</label>\n'
                '            <p class="wl-status" role="status" aria-live="polite"></p>\n'
                '          </form>\n        </div>\n      </div>\n    </section>')
    return ('<!DOCTYPE html>\n<html lang="en">\n' + h + '\n' + header +
            '\n  <main>\n' + body + '\n' + form + '\n  </main>\n' + footer + scripts + '\n</body>\n</html>\n')

POSTS = [
    {
        'file': 'myr-expense-tracker-malaysia.html',
        'chapter': '01', 'kicker': 'Expense tracking',
        'title': 'The best way to track expenses in Malaysia (2026)',
        'dek': 'Cash, cards, and three e-wallets: why MYR tracking breaks, and the 10-minute setup that sticks.',
        'meta': 'Sep 2026 \u00b7 6 min read \u00b7 Chapter 01',
        'body': '''
          <p>A day in Kuala Lumpur touches three wallets before lunch: Touch &rsquo;n Go for the LRT, GrabPay for lunch, and a card for groceries. Each app shows you its own history. None of them show you <em>your</em> month. The result most Malaysians report is the same: money disappears, and the spreadsheet they promised to maintain goes untouched by week two.</p>
          <h2>What a good MYR expense tracker must do</h2>
          <p>Three things, in order. <strong>Fast capture</strong> &mdash; if logging a purchase takes more than ten seconds, you will stop. <strong>Sen-accurate MYR</strong> &mdash; rounded or USD-centric apps quietly corrupt your totals. <strong>One view across products</strong> &mdash; expenses, family commitments, and investments live in the same book, because your money does not care about app categories.</p>
          <h2>The 10-minute setup that sticks</h2>
          <p>Start with a single month of history instead of a full audit. Enter your fixed commitments first (rent, tuition, toll), then log only variable spending for one week &mdash; food, transport, coffee. At the end of the week, categorise once. That single review tells you more than a month of anxious entry, and it builds the habit loop: capture, review, adjust.</p>
          <h2>Where MyBuku fits</h2>
          <p>MyBuku (from <a href="../index.html">buku.pro</a>) is built around exactly these rules: sen-accurate MYR budgets, receipt OCR so capture takes a photo instead of ten keystrokes, family budgets that share one book, and investment accounts alongside daily spending. It is in private beta now &mdash; join the waitlist below and help shape it.</p>
          <p>Next in this series: <a href="family-budgeting-malaysia.html">Family budgeting in Malaysia: one book for the whole house</a>.</p>
        ''',
    },
    {
        'file': 'family-budgeting-malaysia.html',
        'chapter': '02', 'kicker': 'Family budgeting',
        'title': 'Family budgeting in Malaysia: one book for the whole house',
        'dek': 'Gaji day, school fees, Raya, and the weekly grocery run — how to run a household book that everyone actually keeps.',
        'meta': 'Sep 2026 \u00b7 5 min read \u00b7 Chapter 02',
        'body': '''
          <p>Most family budget arguments are not about money; they are about visibility. One partner pays the bills, the other handles daily spending, and neither sees the whole picture until a big number lands. A shared budget fixes the visibility problem first and the arithmetic problem second.</p>
          <h2>Three accounts, one book</h2>
          <p>Structure beats willpower. Keep a <strong>fixed account</strong> for bills and school fees, a <strong>daily account</strong> for groceries and transport, and a <strong>goal account</strong> for Raya, holidays, and emergencies. In MyBuku each one becomes a budget with its own categories, and the family views the same totals &mdash; no more end-of-month surprises about who spent what.</p>
          <h2>The Malaysian calendar is a budget calendar</h2>
          <p>Plan the year around the spikes: back-to-school in March and August, Raya, year-end holidays, and insurance renewals. Put them in the goal account monthly instead of absorbing them as shocks. A rule of thumb that works for many households: if an expense recurs or is predictable, it belongs in the fixed or goal book &mdash; never in this month&rsquo;s guilt pile.</p>
          <h2>Investments belong in the family book too</h2>
          <p>ASB, unit trusts, and share portfolios are household decisions, yet most families track them in a completely different app &mdash; or not at all. MyBuku keeps investment accounts beside daily spending, so the family conversation covers the whole balance sheet, not just the leaky part.</p>
          <h2>Start this week</h2>
          <p>Pick one shared category (groceries is the usual winner), put it in a shared budget, and review it together every gaji day for one month. If the argument disappears, add the rest. MyBuku&rsquo;s family budgets are built for exactly this &mdash; join the beta below.</p>
        ''',
    },
    {
        'file': 'buku-pro-suite.html',
        'chapter': '03', 'kicker': 'The suite',
        'title': 'One book, every agent — meet the buku.pro suite',
        'dek': 'myBuku (Buku Lang, MyBuku BA) and Bukubiz (six department agents, DentalOS AI) — the whole shelf, one dashboard.',
        'meta': 'Sep 2026 \u00b7 5 min read \u00b7 Chapter 03',
        'body': '''
          <p>buku.pro is the brand and the dashboard. Under it: <strong>myBuku</strong> for personal money and <strong>Bukubiz</strong> for your business &mdash; and each product carries usecases built for real Malaysian workplaces.</p>
          <h2>myBuku — personal money, in MYR</h2>
          <p>The flagship for individuals and families: sen-accurate budgets, family budgeting on one shared book, investment accounts beside daily spending, and capped ToyyibPay deposits. In private beta now — the waitlist is open on this site.</p>
          <h2>MyBuku BA — live for beauty retail</h2>
          <p>The Beauty Advisor AI Assistant is delivered and running at <a href="https://ba.buku.pro">ba.buku.pro</a> for KENS Apothecary: sales tracking, CRM, a knowledge base that answers from your own documents, a WhatsApp agent, and credit billing — on web, PWA, and Android. Built for the floor: 459 green tests and a certified new-user journey.</p>
          <h2>Buku Lang — Mandarin for the retail floor</h2>
          <p>MyBuku&rsquo;s second usecase is a research-backed language coach: <strong>Buku Lang: Mandarin Retail Coach</strong>. Beauty advisors learn service Mandarin for real store scenarios — a 14-day agentic beta with mission loops, roleplay, and an AI tutor validated by a second model. Android and web, opening in beta.</p>
          <h2>Bukubiz — six department agents, one interconnect</h2>
          <p>For business, Bukubiz runs six standalone agents — Finance, Marketing, Sales, Operations, HR, and Admin — each with its own process, its own cryptographic identity, and its own tools. They talk over a signed envelope: tamper-evident, org-walled, PII-redacted. Deploy one department or all six.</p>
          <h2>DentalOS AI — the first Bukubiz usecase</h2>
          <p>DentalOS AI applies the department agents to dental clinics: scheduling, inventory, patient communication, and back-office — agents that file, remind, and reconcile while the practice works.</p>
          <h2>Pick your door</h2>
          <p>myBuku — join the waitlist below. MyBuku BA — already live at <a href="https://ba.buku.pro">ba.buku.pro</a>. Bukubiz &amp; DentalOS AI — <a href="../dentalos.html">DentalOS AI</a> and <a href="../bukubiz.html">Bukubiz</a>.</p>
        ''',
    },
]

def post_page(post):
    body = ('    <section class="section">\n      <div class="container">\n'
            '        <div class="post-hero">\n'
            '          <span class="running-head"><span class="folio">' + post['chapter'] + '</span>Blog &middot; ' + post['kicker'] + '</span>\n'
            '          <h1 class="display">' + post['title'] + '</h1>\n'
            '          <p class="lead">' + post['dek'] + '</p>\n'
            '          <p class="post-meta">' + post['meta'] + '</p>\n'
            '        </div>\n      </div>\n    </section>\n'
            '    <section class="section">\n      <div class="container">\n'
            '        <div class="prose">' + post['body'] + '      </div>\n'
            '      </div>\n    </section>')
    return page('Chapter ' + post['chapter'] + ' — ' + post['title'] + ' — buku.pro',
                post['dek'] + ' From the MyBuku team at buku.pro.', body, 'mybuku')

for post in POSTS:
    open('blog/' + post['file'], 'w', encoding='utf-8', newline='\n').write(post_page(post))
print('posts regenerated:', len(POSTS))
