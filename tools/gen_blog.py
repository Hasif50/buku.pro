import re, glob

src = open('index.html', encoding='utf-8').read()

head = src[:src.index('</head>')+7]
header = src[src.index('<header class="nav">'):src.index('</header>')+9]
footer_start = src.index('<footer class="footer">')
footer = src[footer_start:]
footer = footer[:footer.index('</footer>')+9]
scripts = '\n  <script src="assets/js/main.js"></script>\n  <script src="assets/js/waitlist.js" defer></script>'

header_blog = header.replace(
    '<a href="mybuku.html">myBuku</a>',
    '<a href="mybuku.html">myBuku</a>\n        <a href="blog/index.html">Blog</a>', 1)

def page(title, desc, body, waitlist_product=None):
    h = head.replace('<title>buku.pro — AI that works for you</title>', '<title>' + title + '</title>')
    h = h.replace('buku.pro builds AI agents for the work behind every business. Finance, marketing, sales, and operations, handled for you.', desc)
    form = ''
    if waitlist_product:
        form = open('blog/_form_partial.html', encoding='utf-8').read().replace('{product}', waitlist_product)
    return ('<!DOCTYPE html>\n<html lang="en">\n' + h + '\n' + header_blog +
            '\n  <main>\n' + body + '\n' + form + '\n  </main>\n' + footer + scripts + '\n</body>\n</html>\n')

post1_body = '''    <section class="section">
      <div class="container">
        <span class="running-head"><span class="folio">01</span>Blog &middot; Expense tracking</span>
        <h1 class="display">The best way to track expenses in Malaysia (2026)</h1>
        <p class="lead">A practical guide to tracking every Ringgit across cash, cards, and e-wallets &mdash; and why most trackers fail Malaysian users.</p>
        <article>
          <h2>Why tracking in Malaysia is harder than it should be</h2>
          <p>A day in Kuala Lumpur touches three wallets before lunch: Touch &rsquo;n Go for the LRT, GrabPay for lunch, and a card for groceries. Each app shows you its own history. None of them show you <em>your</em> month. The result most Malaysians report is the same: money disappears, and the spreadsheet they promised to maintain goes untouched by week two.</p>
          <h2>What a good MYR expense tracker must do</h2>
          <p>Three things, in order. <strong>Fast capture</strong> &mdash; if logging a purchase takes more than ten seconds, you will stop. <strong>Sen-accurate MYR</strong> &mdash; rounded or USD-centric apps quietly corrupt your totals. <strong>One view across products</strong> &mdash; expenses, family commitments, and investments live in the same book, because your money does not care about app categories.</p>
          <h2>The 10-minute setup that sticks</h2>
          <p>Start with a single month of history instead of a full audit. Enter your fixed commitments first (rent, tuition, toll), then log only variable spending for one week &mdash; food, transport, coffee. At the end of the week, categorise once. That single review tells you more than a month of anxious entry, and it builds the habit loop: capture, review, adjust.</p>
          <h2>Where MyBuku fits</h2>
          <p>MyBuku (from <a href="../index.html">buku.pro</a>) is built around exactly these rules: sen-accurate MYR budgets, receipt OCR so capture takes a photo instead of ten keystrokes, family budgets that share one book, and investment accounts alongside daily spending. It is in private beta now &mdash; join the waitlist below and help shape it.</p>
          <h2>Keep reading</h2>
          <p>Next in this series: <a href="family-budgeting-malaysia.html">Family budgeting in Malaysia: one book for the whole house</a>.</p>
        </article>
      </div>
    </section>'''

post2_body = '''    <section class="section">
      <div class="container">
        <span class="running-head"><span class="folio">02</span>Blog &middot; Family budgeting</span>
        <h1 class="display">Family budgeting in Malaysia: one book for the whole house</h1>
        <p class="lead">Gaji day, school fees, Raya, and the weekly grocery run &mdash; how to run a household book that everyone actually keeps.</p>
        <article>
          <h2>The household is a fund, not a fight</h2>
          <p>Most family budget arguments are not about money; they are about visibility. One partner pays the bills, the other handles daily spending, and neither sees the whole picture until a big number lands. A shared budget fixes the visibility problem first and the arithmetic problem second.</p>
          <h2>Three accounts, one book</h2>
          <p>Structure beats willpower. Keep a <strong>fixed account</strong> for bills and school fees, a <strong>daily account</strong> for groceries and transport, and a <strong>goal account</strong> for Raya, holidays, and emergencies. In MyBuku each one becomes a budget with its own categories, and the family views the same totals &mdash; no more end-of-month surprises about who spent what.</p>
          <h2>The Malaysian calendar is a budget calendar</h2>
          <p>Plan the year around the spikes: back-to-school in March and August, Raya, year-end holidays, and insurance renewals. Put them in the goal account monthly instead of absorbing them as shocks. A rule of thumb that works for many households: if an expense recurs or is predictable, it belongs in the fixed or goal book &mdash; never in this month&rsquo;s guilt pile.</p>
          <h2>Investments belong in the family book too</h2>
          <p>ASB, unit trusts, and share portfolios are household decisions, yet most families track them in a completely different app &mdash; or not at all. MyBuku keeps investment accounts beside daily spending, so the family conversation covers the whole balance sheet, not just the leaky part.</p>
          <h2>Start this week</h2>
          <p>Pick one shared category (groceries is the usual winner), put it in a shared budget, and review it together every gaji day for one month. If the argument disappears, add the rest. MyBuku&rsquo;s family budgets are built for exactly this &mdash; join the beta below.</p>
        </article>
      </div>
    </section>'''

index_body = '''    <section class="section">
      <div class="container">
        <span class="running-head"><span class="folio">&para;</span>Blog</span>
        <h1 class="display">The money book, in chapters.</h1>
        <p class="lead">Practical guides for tracking, budgeting, and investing in Malaysia — written by the MyBuku team.</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <article>
          <h2><a href="myr-expense-tracker-malaysia.html">The best way to track expenses in Malaysia (2026)</a></h2>
          <p class="lead">Cash, cards, and three e-wallets: why MYR tracking breaks, and the 10-minute setup that sticks.</p>
          <h2><a href="family-budgeting-malaysia.html">Family budgeting in Malaysia: one book for the whole house</a></h2>
          <p class="lead">Gaji day, school fees, Raya — a shared household book that everyone actually keeps.</p>
        </article>
      </div>
    </section>'''

open('blog/index.html', 'w', encoding='utf-8', newline='\n').write(page(
    'Blog — buku.pro',
    'Guides on tracking expenses, family budgeting, and investing in Malaysia — from the MyBuku team at buku.pro.',
    index_body))

open('blog/myr-expense-tracker-malaysia.html', 'w', encoding='utf-8', newline='\n').write(page(
    'The Best Way to Track Expenses in Malaysia (2026) — buku.pro',
    'A practical MYR expense-tracking guide for Malaysia: fast capture, sen-accurate budgets, and one view across spending, family, and investments.',
    post1_body, 'mybuku'))

open('blog/family-budgeting-malaysia.html', 'w', encoding='utf-8', newline='\n').write(page(
    'Family Budgeting in Malaysia: One Book for the Whole House — buku.pro',
    'How Malaysian households run a shared family budget: fixed, daily, and goal accounts; the Malaysian budget calendar; and investments in the same book.',
    post2_body, 'mybuku'))

count = 0
for f in glob.glob('*.html'):
    s = open(f, encoding='utf-8').read()
    if '<a href="blog/index.html">Blog</a>' in s:
        continue
    s2 = s.replace('<a href="mybuku.html">myBuku</a>',
                   '<a href="mybuku.html">myBuku</a>\n        <a href="blog/index.html">Blog</a>', 1)
    if s2 != s:
        open(f, 'w', encoding='utf-8', newline='\n').write(s2)
        count += 1
print('pages with Blog nav added:', count)
print('blog pages written: index, post1, post2')
