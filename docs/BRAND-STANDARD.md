# buku.pro — Brand Standard ("The Illuminated Ledger")

Single source of truth for the brand. Every product and site under buku.pro
aligns to this. The reference implementation lives in this repo's
`assets/css/style.css` and the logo SVG below.

## Concept

**buku** is Malay for *book*. The brand is **the illuminated ledger**: your
money and your business, written into one book — and **AI agents do the
writing**, so you can focus on living and growing.

## Goal (the message everything must carry)

> **AI that works for you — personal and business.**

myBuku = personal. Bukubiz = business (six agents). Industry use cases (DentalOS)
are Bukubiz applied to a vertical. Every headline, hero, and footer should land
on this benefit, not on "here are our agents".

## Color tokens (exact)

| Token | Hex | Meaning |
|---|---|---|
| `--bg` | `#0B0F1E` | Aether ink (page) |
| `--bg-soft` | `#0E1324` | lifted section |
| `--bg-elevated` | `#131A2E` | card surface |
| `--ink` | `#F1E8D6` | vellum (text) |
| `--ink-soft` | `#D9D0C2` | secondary text |
| `--muted` | `#8B93A8` | captions |
| `--line` | `#232B40` | hairlines |
| `--accent` | `#D4AF37` | **gold leaf** (book/gilding/value) |
| `--accent-strong` | `#BF9A2E` | gold hover |
| `--blue` | `#6FA8DC` | starlight (agents/live) |
| `--green` | `#4FD1A5` | aurora (money in / done) |
| `--red` | `#E0705A` | ember (warnings) |

Rules: **no purple**. Gold only for micro-touchpoints (logo, key numerals,
CTAs, one headline word); body stays vellum. Blue for "live/agent" cues.

## Typography

- **Display (headlines):** Fraunces — self-hosted woff2 (600/700/800).
- **Body/UI:** Plus Jakarta Sans (400–800).
- **Mono (ledger/labels):** IBM Plex Mono (400/600) for eyebrows, tags,
  timestamps, status chips, feature numbers.

## Logo

Open-book mark (gold stroke on an ink tile). Reuse this exact SVG:

```html
<svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
  <rect width="48" height="48" rx="12" fill="#131a2e" stroke="#232b40"/>
  <path d="M24 12 C20.5 9.9 15.5 9 10.5 9 L10.5 34 C15.5 34 20.5 34.8 24 37 C27.5 34.8 32.5 34 37.5 34 L37.5 9 C32.5 9 27.5 9.9 24 12 Z" fill="none" stroke="#d4af37" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M24 12 L24 37" stroke="#d4af37" stroke-width="2.6"/>
</svg>
```

Favicon: same book glyph, gold square `#D4AF37` with ink `#0B0F1E` stroke.

## Signature motifs (reuse, don't reinvent)

1. **Starfield + nebula** background (layered radial-gradients, gold + blue glow).
2. **Agent constellation** — nodes + lines (the six agents around the gold hub),
   drawn-in via `stroke-dashoffset`, nodes ping.
3. **Live ledger** — "the book writes itself" monospace feed with done/working/
   queued chips.
4. **Vellum grain** — `feTurbulence` noise overlay at ~4% opacity.
5. **Gold shimmer** on gradient headline words; **magnetic** CTAs; **cursor glow**.

## Motion

Always-on ambient (twinkle, shimmer, node pulse) + scroll reveals + parallax.
Everything disabled under `prefers-reduced-motion`. Desktop-only effects guard
on `(pointer: fine)`.

## Applying it to another repo

1. Copy the `@font-face` blocks + `:root` tokens + the logo SVG.
2. Use the tokens everywhere (no hardcoded colors).
3. Write copy that lands on "AI that works for you".
4. Keep the same palette discipline: one gold accent, one starlight blue, no purple.
