# Design Research: vanlent.dev & the particle-hero / typography-first / dark-gold landscape (for buku.pro)

**Methodology note.** No third-party writeups, Dribbble/Behance posts, or reviews of vanlent.dev exist (searched from multiple angles; it is a small Dutch freelancer portfolio). Findings on it below come from **live inspection**: I fetched `https://vanlent.dev` (Next.js/Turbopack + Tailwind v4, canonical `https://timvanlent.com`), its CSS, and 25 JS chunks, and extracted colors, fonts, and the particle-system config. Its OpenGraph image is saved at `G:\mybuku\.research\vanlent_og.png` for reference.

---

## 1. vanlent.dev — what it actually is

Tim van Lent, "Creative Developer," Amsterdam. Visual language, from the source:

- **Hero = a Three.js particle field**, not a canvas-dot background: config shows `shape:"nestedSpheres2"`, `particleCount: 33000`, `dustRatio: 0.05`, `wobble`/`curl` noise (`curl 0.78`, `curlFrequency 0.36`), sphere shells (`sphereGraticule`, rotation), mouse interaction (`HOME_FOOTER_MOUSE_INTERACTION`), and bloom post-processing — a `BubbleDevCanvas` component (JS chunk `60436397`, `33572b`, `b0a8ea`). This is the "globe-like dots" you remember: a rotating, curled, double-shell sphere of ~33k points.
- **Typography:** Montserrat (headlines) + IBM Plex Mono (labels/eyebrows) — a grotesque + mono metadata stack, not a serif. Dark theme (`data-theme="dark"`).
- **Editorial framing:** numbered index labels `01. CREATIVE DEVELOPER — Shaping Concepts`, `02. AMSTERDAM BASED — Building Experiences`, `04. AVAILABLE FOR WORK`, a live 12-hour clock ("PM AM"), EN/NL language switch, portrait (`/me.jpg`).
- **Motion:** GSAP-driven `clip-path: inset(0% 0% 100% 0%)` reveal transitions (this is the "page scrolling like changing pages" feel — scroll reveals projects), GSAP page transitions between project sections (his own prior site, "van Lent-Archive," was "Nuxt with GSAP page transitions").
- **Sections:** Selected Work (6 projects: Neo Advertising, Macada, Innovision Hero, Arithm, Van Lent Art, van Lent-Archive — all WordPress/Nuxt + GSAP builds), Services ("Code, performance, and design working together. Without compromise."), tech logos as masked SVG monochrome marks.

## 2. Particle / point-cloud / dot aesthetic: premium or played out?

Verdict from 2025–2026 commentary: **the generic canvas-dot background is played out; a single well-executed 3D particle *object* is still premium.**

- "Most pages avoid flashy interactions… clean design: solid typography, clear layout" — Evil Martians' study of 100+ dev-tool landing pages ([URL](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025)).
- Animated/particle hero backgrounds are on the "fading" lists: "From 'Wow' to 'Wait, What?'" ([URL](https://www.ultimatewb.com/blog/6003/from-wow-to-wait-what-web-design-trends-already-fading-but-not-gone/)), "Why I Stopped Using Animated SVG Backgrounds on Webflow Hero Sections" ([URL](https://www.pravinkumar.co/blog/stopped-animated-svg-backgrounds-webflow-hero-2026)), "The Website Trends That Are Dying in 2025" ([URL](https://maplewebdesign.ca/blog/web-design-trends-dying-2025/)); "Stop Using Hero Images! They're Killing Your UX" ([URL](https://webdesignerdepot.com/stop-using-hero-images-theyre-killing-your-ux/)).
- The winning pattern (Utsubo's analysis of 8 award Three.js sites): "The standout sites pick one hard idea and execute it cleanly… rather than stacking effects," and "Scroll became the storytelling engine… sequencing 3D scenes rather than moving a 2D page" ([URL](https://www.utsubo.com/blog/best-threejs-websites-2026)).

**8–12 reference heroes (what works / what fails):**

1. **vanlent.dev** — nested particle sphere + editorial type. Works: one object, mono metadata, restrained palette. Fails if: 33k particles on low-end mobile.
2. **Oryzo (by Lusion)** — single inertial 3D object, Awwwards Site of the Month Apr 2026; "sell one object properly" ([Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)).
3. **Lusion (lusion.co)** — the canonical real-time 3D/particle studio ([showcase](https://www.webgpu.com/showcase/lusion-real-time-3d-wizardry/)).
4. **Penderecki's Garden** — photogrammetry point-cloud memorial; point clouds as *meaning*, not decoration ([showcase](https://www.webgpu.com/showcase/pendereckis-garden-threejs-point-cloud-photogrammetry/)).
5. **IVRESS** — WebGPU + WebGL fallback; tech-forward but heavy ([Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)).
6. **Shopify Editions** — scroll-sequenced product reveal; the closest model to "scrolling like turning pages" ([Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)).
7. **Cartier Watches & Wonders** — six scrollable 3D "alcoves," a scene per product ([Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)).
8. **The Macallan** — Awwwards Site of the Day; dark + gold, whisky-as-craft ([Awwwards](https://www.awwwards.com/sites/the-macallan)).
9. **Hubtown** — 3D monolith + mouse-reveal for a B2B brand ([Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)).
10. **Sleep Well Creative** — scroll-driven editorial 3D narrative ([Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)).
11. **SpaceForce.com** — Awwwards SOTD, space-dot aesthetic ([Awwwards](https://www.awwwards.com/sites/spaceforce-com)).
12. **Immersive Garden / Huncwot / Merci-Michel** — WebGL studio sites to study ([tags](https://www.webgpu.com/tag/huncwot/), [tag](https://www.webgpu.com/tag/merci-michel/), [tag](https://www.webgpu.com/tag/immersive-garden/), [immersive-g.com](https://immersive-g.com/projects/aten7/)).
    Failure mode: generic particle canvases with no concept read as templates — the "fading trend" critique above.

## 3. Typography-first hero consensus (2025–2026)

- **Structure:** centered composition, big bold headline, supporting graphic *below* the headline; only a minority use side-by-side. Eyebrows/badges above the title are standard. Main visual options ranked: animated product UI, static product UI (Linear), switchable UIs (Mintlify), live embed (Pixelcut), code snippet (Tailwind), abstract illustration or none (Recraft) ([Evil Martians](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025)).
- **Serif revival:** "Why AI brands are obsessed with serif fonts" — serif display type signals intelligence/premium in AI branding ([Creative Bloq](https://www.creativebloq.com/design/fonts-typography/why-ai-brands-are-obsessed-with-serif-fonts)); 2025 typography trends confirm oversized display type + mono accents ([Typographic Panorama 2025](https://twks.ch/en/insights/typographic-panorama-2025), [Trending Fonts 2025](https://www.afontfinder.com/blog/trending-fonts-2025)).
- **Bold minimalism is the loud trend:** "Bold Minimalism Isn't New, It's Just Louder This Time" ([Unmatchedstyle](https://unmatchedstyle.com/news/bold-minimalism.php)); what's gone vs new in 2025/2026 trend lists ([tru.agency](https://dev-redesign.tru.agency/blogs/web-design-trends-2025-vs-2024-whats-new-and-whats-gone)).
- **Gradient/duotone text** is a legit accent trend but best used tonally, not rainbow ([Awwwards gradient collection](https://www.awwwards.com/gradients-in-web-design-elements.html)).

## 4. Dark navy + gold + parchment / illuminated-manuscript vibes

- **The Macallan** — Awwwards SOTD, the canonical dark + gold + craft storytelling site ([Awwwards](https://www.awwwards.com/sites/the-macallan)).
- **Louis XIII Cognac** — dark + gold luxury e-commerce/editorial, multiple agency case studies ([creasenso](https://creasenso.com/en/portfolios/digital/direction-artistique-web/amandia/louis-xiii-cognac-website), [Eloi Motte](https://eloimotte.xyz/works/louis-xiii), [Blackballoon](https://www.blackballoon.studio/en/projets/louis-xiii-website/)).
- **Cartier Watches & Wonders** — luxury brand, gold-on-dark, scroll-sequenced "museum rooms" ([Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)).
- **Tonal-balance consensus for gold-on-dark:** gold must stay an accent — gold/brass < ~10% of surface, warm neutral text (parchment/cream, not pure white), deep navy/charcoal as the 60–70% base; luxury color psychology pieces ([Niche Websites](https://nichewebsites.com/blog/color-psychology-luxury-web-design), [ideahits luxury web design](https://ideahits.com/luxury-web-design-ideas)).

---

## Implications for buku.pro

1. **Copy vanlent's core formula, not its decoration:** one meaningful particle *object* (a book / open book / stacked pages as point clouds) + one huge editorial headline + mono metadata labels (01., 02., …) + GSAP scroll reveals. One object, executed well, beats a generic dot field ([Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)).
2. **Make the particle object *book-shaped*, not a globe.** The user's brief ("globe-like dots but book-shaped") is already the right instinct — a rotating point-cloud book with curl noise, dust, and mouse interaction, mirroring vanlent's `nestedSpheres2` config but with a book/magazine silhouette.
3. **"Page scrolling like changing pages" should be scroll-sequenced scenes, not a literal page-flip widget.** Model it on Shopify Editions / Cartier alcoves — each scroll step reveals the next "page"/section with clip-path transitions (vanlent's `inset(0% 0% 100% 0%)` reveal) ([Utsubo](https://www.utsubo.com/blog/best-threejs-websites-2026)).
4. **Budget the particles:** vanlent ships 33k particles — too heavy for mobile. Ship a mobile/`prefers-reduced-motion` tier (e.g., 4–6k particles or a static rendered poster), preload fonts + hero image, and keep LCP < 2.5s. Vanlent itself preloads fonts and the portrait — copy that discipline.
5. **Typography direction:** a literary serif display for the headline (on-trend for premium/AI brands, [Creative Bloq](https://www.creativebloq.com/design/fonts-typography/why-ai-brands-are-obsessed-with-serif-fonts)) + grotesque body + a mono face (IBM Plex Mono style) for the index/eyebrow metadata — vanlent's exact stack swapped for a book-appropriate serif.
6. **Hero layout:** centered headline with the particle book as ambient background *behind* it and the actual product UI (or an animated book mock) as the supporting visual *below* — the 2025 consensus layout ([Evil Martians](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025)). buku.pro is a product; abstract visuals alone won't convert.
7. **Palette:** deep navy base (~60–70%), gold/bronze accents (<10%, used on the particle book, hairlines, hover states, and headline gradient at most), parchment/cream text instead of pure white. The Macallan/Louis XIII tonal model ([Awwwards](https://www.awwwards.com/sites/the-macallan), [Blackballoon](https://www.blackballoon.studio/en/projets/louis-xiii-website/)).
8. **Parchment as light mode, not the default:** keep dark-navy + gold as the signature theme; offer a parchment light mode with navy text — don't make the whole site look like a manuscript, that reads "template," not "illuminated" ([Niche Websites](https://nichewebsites.com/blog/color-psychology-luxury-web-design)).
9. **Avoid the played-out traps:** no generic full-screen canvas-dot background, no hero image with text slapped on top, no stacked effects ([Web Designer Depot](https://webdesignerdepot.com/stop-using-hero-images-theyre-killing-your-ux/), [Evil Martians](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025)).
10. **Motion as storytelling, with restraint:** GSAP ScrollTrigger reveals and page transitions only where they reinforce the "reading a book" metaphor; respect `prefers-reduced-motion` and keep transitions under ~0.8s.
11. **Gradient budget:** a navy→gold gradient on the headline or gold duotone on the book particles is on-trend ([Awwwards gradients](https://www.awwwards.com/gradients-in-web-design-elements.html)) — use it in one place max, never rainbow.
12. **Art direction cheap wins:** numbered index labels (01.–04.), a live clock/status line in mono, EN/… language switch, monochrome masked-SVG partner logos — the small editorial details that make vanlent.dev read as art-directed without extra 3D cost.
