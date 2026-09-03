#!/usr/bin/env python3
"""buku.pro SEO/OG package: og-image, per-page OG/canonical meta, robots, sitemap."""
import re, glob, os
from PIL import Image, ImageDraw, ImageFont

GOLD = (212, 175, 55)
INK = (19, 26, 46)
PAPER = (250, 247, 240)

# ---------- 1. OG image (1200x630 brand card) ----------
W, H = 1200, 630
img = Image.new('RGB', (W, H), INK)
d = ImageDraw.Draw(img)
# gold rule
d.rectangle([80, 150, 86, 320], fill=GOLD)
try:
    fb = ImageFont.truetype('C:/Windows/Fonts/times.ttf', 88)
    fs = ImageFont.truetype('C:/Windows/Fonts/times.ttf', 44)
    fm = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 30)
except Exception:
    fb = fs = fm = ImageFont.load_default()
d.text((120, 170), 'buku.pro', font=fs, fill=(250, 247, 240))
d.text((120, 260), 'Your money and business,', font=fb, fill=GOLD)
d.text((120, 360), 'written into one book.', font=fb, fill=(250, 247, 240))
d.text((120, 470), 'myBuku \u00b7 Bukubiz \u00b7 one dashboard', font=fm, fill=(160, 170, 200))
img.save('assets/og-image.png', optimize=True)
print('og-image.png:', os.path.getsize('assets/og-image.png') // 1024, 'KB')

# ---------- 2. per-page meta injection ----------
SITE = 'https://buku.pro'
PAGES = {
    'index.html': ('/', 'buku.pro — AI that works for you',
                   'buku.pro builds AI agents for the work behind every business. Finance, marketing, sales, and operations, handled for you.'),
    'mybuku.html': ('/mybuku', 'MyBuku — personal finance, MYR budgets, family & investments',
                    'Track spending in Ringgit, budget together with family, watch investments, top up via ToyyibPay — the Malaysian money app from buku.pro.'),
    'bukubiz.html': ('/bukubiz', 'Bukubiz — six AI department agents for your business',
                     'Finance, marketing, sales, operations, HR, and admin — standalone AI agents over a signed interconnect, from buku.pro.'),
    'dentalos.html': ('/dentalos', 'DentalOS AI — the Bukubiz usecase for dental clinics',
                      'Scheduling, inventory, patient communication, and back-office — AI agents for dental clinics, from buku.pro.'),
    'blog/index.html': ('/blog', 'Blog — buku.pro',
                        'Practical guides on tracking expenses, family budgeting, and investing in Malaysia — from the MyBuku team.'),
    'blog/myr-expense-tracker-malaysia.html': ('/blog/myr-expense-tracker-malaysia', 'The Best Way to Track Expenses in Malaysia (2026)',
                                               'A practical MYR expense-tracking guide: fast capture, sen-accurate budgets, and one view across spending, family, and investments.'),
    'blog/family-budgeting-malaysia.html': ('/blog/family-budgeting-malaysia', 'Family Budgeting in Malaysia — buku.pro',
                                            'Fixed, daily, and goal accounts; the Malaysian budget calendar; and investments in the same family book.'),
    'blog/buku-pro-suite.html': ('/blog/buku-pro-suite', 'One book, every agent — the buku.pro suite',
                                 'myBuku (Buku Lang, MyBuku BA) and Bukubiz (six agents, DentalOS AI) — the whole shelf, one dashboard.'),
}

def inject(path, canonical, og_title, og_desc):
    s = open(path, encoding='utf-8').read()
    if 'property="og:title"' in s:
        return 'already'
    title_m = re.search(r'<title>([^<]*)</title>', s)
    page_title = title_m.group(1) if title_m else og_title
    meta = (
        f'  <link rel="canonical" href="{SITE}{canonical}">\n'
        f'  <meta property="og:type" content="website">\n'
        f'  <meta property="og:site_name" content="buku.pro">\n'
        f'  <meta property="og:title" content="{page_title}">\n'
        f'  <meta property="og:description" content="{og_desc}">\n'
        f'  <meta property="og:url" content="{SITE}{canonical}">\n'
        f'  <meta property="og:image" content="{SITE}/assets/og-image.png">\n'
        f'  <meta name="twitter:card" content="summary_large_image">\n'
    )
    # insert right after the viewport meta (present on every page)
    s = re.sub(r'(<meta name="viewport"[^>]*>)', r'\1\n' + meta, s, count=1)
    open(path, 'w', encoding='utf-8', newline='\n').write(s)
    return 'injected'

for path, (canonical, og_title, og_desc) in PAGES.items():
    print(path, '->', inject(path, canonical, og_title, og_desc))

# department pages + remaining pages: canonical + generic og (title reuse)
for f in glob.glob('*.html'):
    if f in PAGES:
        continue
    canonical = '/' + f.replace('.html', '')
    title_m = re.search(r'<title>([^<]*)</title>', open(f, encoding='utf-8').read())
    og_title = title_m.group(1) if title_m else 'buku.pro'
    r = inject(f, canonical, og_title, 'AI agents for the work behind every business — from buku.pro.')
    print(f, '->', r)

# ---------- 3. sitemap + robots ----------
urls = ['/', '/mybuku', '/bukubiz', '/dentalos', '/blog', '/blog/myr-expense-tracker-malaysia',
        '/blog/family-budgeting-malaysia', '/blog/buku-pro-suite']
urls += ['/bukubiz-admin', '/bukubiz-finance', '/bukubiz-hr', '/bukubiz-marketing',
         '/bukubiz-operations', '/bukubiz-sales']
today = '2026-09-03'
sm = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u in urls:
    sm.append(f'  <url><loc>{SITE}{u}</loc><lastmod>{today}</lastmod></url>')
sm.append('</urlset>')
open('sitemap.xml', 'w', encoding='utf-8', newline='\n').write('\n'.join(sm) + '\n')

open('robots.txt', 'w', encoding='utf-8', newline='\n').write(
    'User-agent: *\nAllow: /\n\nSitemap: https://buku.pro/sitemap.xml\n')
print('robots.txt + sitemap.xml written:', len(urls), 'urls')
