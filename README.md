# buku.pro

Marketing site for **buku.pro**, the home of two products:

- **myBuku** — personal finance for Malaysia (track spending, budget, save,
  invest, family money).
- **Bukubiz** — business finance for Malaysian SMEs (expenses, invoicing, cash
  flow, team access).

## Structure

```
buku-pro/
├── index.html          # home — hero, product split, features, CTA
├── mybuku.html         # myBuku product page
├── bukubiz.html        # Bukubiz product page
├── assets/
│   ├── css/style.css   # shared stylesheet
│   ├── js/main.js      # nav toggle + restrained scroll reveal
│   └── fonts/          # self-hosted Plus Jakarta Sans (woff2)
└── README.md
```

## Design

Built against the [taste-skill](https://github.com/Leonxlnx/taste-skill)
"anti-slop" rules: neutral slate base with one blue accent (aligned with the
myBuku brand color), no AI-purple gradients, no serif, restrained motion, one
CTA label per intent, and no em-dashes in copy.

## Deploy

Static site — deploy to Cloudflare Pages, Netlify, or Vercel:

```bash
# Cloudflare Pages (from this directory)
npx wrangler pages deploy . --project-name buku-pro
```

Then attach the `buku.pro` domain in the Pages custom domains tab.

## Before launch

The balance/cash-flow cards on each page use **sample data** (marked with
`<!-- sample data -->` comments). Replace them with real product screenshots
before public launch:

- `index.html` — hero balance card
- `mybuku.html` — rainy-day fund card
- `bukubiz.html` — cash-flow card

Also replace the `mailto:` waitlist CTAs with a real signup link when the
products open.
