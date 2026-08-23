# buku.pro

Marketing site for **buku.pro**, the platform for AI agentic services for
businesses.

- **Bukubiz** — AI agents for every business department (finance, marketing,
  sales, operations). The main business product.
- **myBuku** — personal finance for Malaysia (track spending, budget, save,
  invest, family money). The consumer product.
- **DentalOS AI** — the first vertical use case: the AI operating system for
  dental clinics (see `G:\dentalos-ai`).

## Structure

```
buku-pro/
├── index.html          # home — hero, product split, use case, features, CTA
├── mybuku.html         # myBuku (personal) product page
├── bukubiz.html        # Bukubiz (business AI agents) product page
├── dentalos.html       # DentalOS AI use-case page
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

Static site — free options, in order of preference.

### GitHub Pages (recommended — git-native, free TLS)

1. Create a GitHub repo and push:
   ```bash
   git remote add origin git@github.com:<you>/buku-pro.git
   git push -u origin master
   ```
2. Repo → **Settings → Pages → Source: GitHub Actions** (the workflow in
   `.github/workflows/pages.yml` deploys the root directory on every push).
3. Custom domain: the `CNAME` file already contains `buku.pro`. In Pages →
   Custom domain, confirm it, then in your DNS add GitHub's Pages records:
   - 4 × `A` records → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153` (apex `buku.pro`)
   - `CNAME www` → `<you>.github.io` (optional)

### Cloudflare Pages (alternative — unlimited bandwidth)

```bash
npx wrangler login          # once
.\deploy.ps1                # deploys to Cloudflare Pages
```

Then attach `buku.pro` in the Pages custom domains tab.

## Adding a vertical

Each vertical is a page plus a card in the "Verticals" section of `index.html`.

1. Copy `dentalos.html` to `<vertical>.html` and rewrite its copy.
2. Add a nav link in the header of every page.
3. Add a card in the "Verticals" section (copy the `product-card` block for
   DentalOS AI and change the tag, title, copy, and link).
4. When there are 2+ verticals, wrap the cards in a `<div class="split-grid">`
   so they lay out side by side.

## Before launch

The balance/cash-flow cards on each page use **sample data** (marked with
`<!-- sample data -->` comments). Replace them with real product screenshots
before public launch:

- `index.html` — hero balance card
- `mybuku.html` — rainy-day fund card
- `bukubiz.html` — cash-flow card

Also replace the `mailto:` waitlist CTAs with a real signup link when the
products open.
