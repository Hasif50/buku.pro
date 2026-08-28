# buku.pro Redesign — Research Synthesis (2026-08)

Deep research commissioned after the dot-book/page-flip iteration was rejected as
"ugly". Four parallel research tracks + first-hand audits. Every claim carries its
source; the per-track reports are stored alongside this file:

- `vanlent-design-research.md` — live-source audit of vanlent.dev + hero-design landscape
- Track B/C/D findings summarized inline below (full reports were delivered in-session)

---

## 1. The four evidence tracks — what they found

### Track 1 · Premium landing-page principles
Sources: CXL luxury-UX research, ColorHero, Webdesigner Depot, Visma, BetterLaunch,
SaasHero, designsystems.one, Savvy (LCP), Pravin Kumar, Evil Martians.

- "Expensive" = restraint: fewer elements, bigger whitespace, slower/fewer motions,
  limited palette. "Cheap" = maximalism without system.
- Ambient looping motion (particle canvases, animated backgrounds) is the
  single most-cited "cheap" device and measurably hurts LCP.
- Font roles: one display face + one body sans + mono **restricted to data/labels**.
  Mono in headings/body reads "developer aesthetic".
- Type scale: ~4 sizes with strong contrast via `clamp()`, one size per role.
- Motion: 150–500 ms, one easing curve, one signature moment.
- Two-product pages: one lead product in the hero + anchorable per-product sections;
  add social proof after the hero and a final CTA/FAQ close (both currently missing).

### Track 2 · Scroll-driven storytelling / page-flip evidence
Sources: NN/g scrolling & attention, Chrome "20 Things" case study, digitalmatters.me
(flipbooks), shorthand.com, WCAG 2.2 (1.1.1/1.3.1/2.2.2), hidde.blog, Deque, MDN
ScrollTimeline, developer.chrome.com, Unbounce/Cro Show/Personizely hero tests.

- Page-flip embeds are the one pattern with explicit, data-backed criticism:
  text trapped in canvas kills zoom/selection/mobile reading/analytics.
- Sticky/pinned scroll is fragile; CSS ScrollTimeline is the sanctioned path.
- Canvas-only captions fail WCAG 2.2; fallback = content in DOM + static layout +
  prefers-reduced-motion gate + pause control.
- B2B SaaS hero: value prop + one CTA; hero-motion A/B evidence is mixed-to-negative.

### Track 3 · Editorial / book aesthetics done well
Sources: Pentagram (Paris Review, Mozilla "Nothing Personal"), Psyche/Aeon, Cabinet
Magazine, Stripe Press, Kinfolk, Aesop, SSENSE, Butterick's Practical Typography,
skeuomorphism trend commentary, Readymag WOTY 2024, Awwwards typography pool.

- Every award-grade editorial benchmark is type-led, strict-grid, ornament-free —
  **none render a physical book object** (Stripe Press sells books and still uses
  editorial pages, not a shelf or flipbook).
- The failure mode of object metaphors: decorative fidelity without functional
  metaphor. The success mode: metaphorical naming + typographic craft.
- Print craft: 60–75 character measure at 1.5–1.6 leading (highest-impact fix);
  one dominant type moment per viewport; warm near-neutral paper/ink palettes.
- Gold demoted to 1px hairline rules and folio numerals — never fills.
- Replace object animation with print rhythm: running heads, folio numbers,
  chapter-break pages, drop caps.

### Track 4 · vanlent.dev & the particle/hero landscape
Source: live fetch + 25 JS chunks of vanlent.dev; Utsubo's 8 award Three.js sites;
Evil Martians' 100-landing-page study; Awwwards (Macallan, SpaceForce); Creative Bloq.

- vanlent.dev's real system: **one meaningful particle object** (Three.js
  `nestedSpheres2`, 33k points, curl noise, bloom, mouse interaction) + one huge
  editorial headline + mono metadata labels (01. CREATIVE DEVELOPER, live clock) +
  GSAP clip-path scroll reveals. "Pages changing" = clip-path scene transitions,
  **not literal page flips**.
- Generic particle backgrounds: fading trend. One well-executed particle OBJECT:
  still premium (Oryzo/Lusion, Macallan, Cartier alcoves, Shopify Editions).
- Typography-first hero consensus: centered huge headline, supporting visual BELOW
  (product UI ranked best). Serif display = premium/AI-brand on-trend.
- Dark navy + gold + parchment model (Macallan, Louis XIII): navy 60–70% base,
  gold < ~10% surface, warm parchment text (never pure white).

---

## 2. Diagnosis — why the current build reads ugly

From the code audit (palette/font/effect inventory) against the evidence above:

1. **Costume, not system** — the book is a decoration (dot canvas + flip physics)
   on a conventionally-laid-out page; the evidence says metaphor lives in naming,
   typography and structure, not rendered objects.
2. **Eight competing devices** — preloader with fake % counter, dot canvas, page-flip,
   ledger ticker, magnetic buttons, stat counters, eyebrow rules, fleuron. Each is
   individually defensible; together they are the documented "many effects" failure.
3. **Gold overload** — 20 hard-coded gold references + 7 gold-gradient usages vs
   5 starlight-blue; gold is on everything, so nothing is special. Evidence: gold
   < 10% surface, hairlines not fills.
4. **Mono everywhere** — 16+ mono usages at tiny uppercase sizes; evidence says mono
   is metadata only.
5. **No measure discipline / no type scale** — centered layouts, long lines,
   moderate display sizes; evidence: 60–75ch measure, one dominant type moment.
6. **The 400vh sticky flip stage** — floating ungrounded object, abstract dot "text",
   empty scroll; evidence: page-flip embeds fail hardest on mobile + WCAG.
7. **Missing conversion anatomy** — no social proof, no FAQ, weak final close.
8. **Canvas-rendered captions** would fail WCAG even if the flip worked.

---

## 3. Converged redesign principles (all four tracks agree)

1. Remove the rendered book object, the flip physics, and the ambient dot canvas.
2. Keep the book **in language**: "The Ledger", "Chapter I/II/III", folios, running
   heads, drop caps, colophon in the footer.
3. Typography-first hero: one huge Fraunces headline, one subhead, one CTA; the
   supporting visual BELOW (product-UI style panel, not abstract).
4. One signature motion (ink-write reveals / clip-path scene transitions =
   "the book writes itself"), 150–500 ms, one easing, reduced-motion fallback.
5. Editorial grid: asymmetric, large margins, 60–75ch measure, running heads +
   folio numerals in gold hairlines.
6. Palette discipline: deep ink navy base (~65%), vellum text, gold < 10% as
   hairlines/folios/small accents, starlight blue sparingly (links, one data point).
7. Structure: hero → social proof strip → one section per product (anchors) →
   use case → FAQ → final CTA.
8. If any particle/3D moment survives: ONE object, budgeted (DPR cap, 4–6k points
   mobile, reduced-motion poster), never a full-screen ambient field.

---

## 4. Candidate directions

### A — "The Ledger" (dark editorial manuscript) — RECOMMENDED
Dark ink editorial in the Paris Review/Stripe Press tradition, keeping the current
brand palette but disciplined:
- Hero: massive Fraunces headline ("Your money, written in one book."), one CTA,
  a typographic "book cover" panel (Stripe-Press-style cover art, static HTML/CSS)
  as the supporting visual below.
- Sections as chapters: mono running heads + gold folio numerals (01/02/03),
  drop caps on feature sections, 62–70ch measure, asymmetric margins.
- Motion: existing ink-write reveals + scroll-progress hairline + clip reveals;
  delete canvas, flip, preloader, ticker, magnetic buttons, fleuron overload.
- Cheapest vanlent wins: numbered labels, mono metadata line, single gradient max.

### B — "The Blueprint" (vanlent-style technical system)
The user's original reference, executed as a system:
- Strict block grid + corner brackets + crosshairs + numbered index labels
  (01. THE LEDGER) + mono status line; Plus Jakarta Sans at light weights, huge
  uppercase headlines (weight 200–300), IBM Plex Mono metadata.
- ONE particle object: book-shaped point-cloud (adapted from vanlent's
  nestedSpheres config) with DPR/mobile/reduced-motion tiers; behind the headline.
- GSAP-style clip-path scroll transitions between "scenes" (the "pages changing"
  feel without a flip widget).

### C — "Ivory Folio" (light editorial)
- Warm ivory paper, near-black ink, gold hairlines; Paris Review/Psyche energy;
  parchment as LIGHT mode (evidence: parchment reads best light).
- Biggest palette change; strongest "print" credibility; darkest mode later.

---

## 5. Verification plan (unchanged quality gates)

- `impeccable detect` browser scan must exit 0 (brand-ignore config maintained).
- Headless Chrome (puppeteer-core): console-error-free at all scroll depths,
  mobile 390px no overflow, prefers-reduced-motion + no-JS fallbacks render.
- Progressive enhancement: `.js` gates all hidden states; content in DOM.
- Deploy: `npx wrangler pages deploy . --project-name buku-pro --branch main`.
