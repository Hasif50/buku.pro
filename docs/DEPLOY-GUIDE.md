# buku.pro — Full Deployment Guide

Last updated: 2026-07-13

Step-by-step for taking the whole buku.pro ecosystem live, with exact commands.
The work is split into four independent tracks; do them in any order.

---

## 0. What's already done on this machine

| Tool | State |
|---|---|
| Node 22, Git, Flutter 3.24, Deno 2.9.5 | installed |
| armada v1.2.9 | installed globally |
| opencode 1.17.7 | installed |
| OmniRoute gateway | running on `http://localhost:20129` |
| opencode → OmniRoute | configured (default model `omniroute/best-coding`) |
| taste-skill skills | installed in `G:\.agents\skills\` |
| buku.pro site | built at `G:\buku-pro` (4 pages, render-verified) |
| mybuku app | `G:\mybuku` (343 Flutter tests + 82 functions tests green) |
| Supabase pilot | `G:\mybuku\supabase` (reservation + settle verified) |

---

## 1. Deploy buku.pro (Cloudflare Pages) — free

1. Log in once (browser OAuth):
   ```powershell
   cd G:\buku-pro
   npx wrangler login
   ```
2. Deploy:
   ```powershell
   .\deploy.ps1
   ```
   Or equivalently: `npx wrangler pages deploy . --project-name buku-pro`
3. Attach the domain:
   - Cloudflare dashboard → Workers & Pages → `buku-pro` → Custom domains → Add
     custom domain → `buku.pro` (and `www.buku.pro` as redirect).
   - Add the CNAME/apex records Cloudflare shows you to your DNS.
4. Verify `https://buku.pro` loads and TLS is valid (can take a few minutes to
   a few hours for DNS + cert).

---

## 2. Deploy mybuku (Firebase)

Firebase is the app's runtime (Auth, Firestore, Storage, Functions, ToyyibPay).

1. Install and log in:
   ```powershell
   npm install -g firebase-tools
   firebase login
   firebase use mybuku-d77f1
   ```
2. Deploy backend (functions, Firestore rules/indexes, Storage rules):
   ```powershell
   cd G:\mybuku
   firebase deploy --only functions,firestore:rules,firestore:indexes,storage
   ```
3. Build + deploy the web app:
   ```powershell
   flutter build web --release `
     --dart-define=MYBUKU_PRIVACY_POLICY_URL=https://buku.pro/privacy `
     --dart-define=MYBUKU_TERMS_URL=https://buku.pro/terms `
     --dart-define=MYBUKU_SUPPORT_EMAIL=support@buku.pro
   firebase deploy --only hosting
   ```
4. Point the app at a subdomain later (e.g. `app.buku.pro`) via Hosting → Add
   custom domain, or leave it on the default `mybuku-d77f1.web.app`.

> Note: Firebase Functions on Node 20 requires the Blaze (pay-as-you-go) plan,
> so `firebase deploy --only functions` will prompt you to enable billing. Set a
> Google Cloud billing budget alert first. Starter traffic stays within the free
> ~2M invocations/month allowance.

---

## 3. Stand up the Supabase pilot (free)

1. Log in and create a free project:
   ```powershell
   npx supabase login
   npx supabase projects create mybuku-pilot --region ap-southeast-1
   ```
   (or create it in the dashboard at supabase.com)
2. Link and push the schema:
   ```powershell
   cd G:\mybuku\supabase
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
3. Deploy edge functions and set secrets:
   ```powershell
   npx supabase functions deploy agent-api finance-api ledger-api ocr-api payment-api market-api
   npx supabase secrets set TOYYIBPAY_SECRET_KEY=... TOYYIBPAY_CATEGORY_CODE=... ALPHA_VANTAGE_API_KEY=...
   ```
4. (Optional) wire the Flutter app to Supabase at build time:
   ```powershell
   flutter build web --release --dart-define=MYBUKU_SUPABASE_URL=<url> --dart-define=MYBUKU_SUPABASE_ANON_KEY=<anon>
   ```

> Supabase is a pilot layer, not the app's source of truth. See
> `G:\mybuku\docs\supabase-free-tier-activation.md` for the full picture.

---

## 4. Run armada with opencode + OmniRoute

opencode is already configured to use OmniRoute. armada drives opencode agents,
so it can use OmniRoute too.

### 4.1 Verify opencode → OmniRoute

```powershell
# confirm the default model and provider (already set)
Get-Content $env:USERPROFILE\.config\opencode\opencode.json

# smoke test: the gateway must answer through opencode
opencode run -m omniroute/best-coding "Reply with exactly: OK"
```

### 4.2 Point armada at OmniRoute (instead of OpenRouter)

armada's default catalog is `opencode-go` (primary) + `openrouter`
(fallback/power). To use OmniRoute for every role:

```powershell
cd <the-repo-you-want-the-fleet-to-work-on>   # e.g. G:\dentalos-ai
armada init
```

Then edit `armada/armada.yaml` and set each role's `model:` to an OmniRoute
model id (the ids exposed by your gateway, e.g. `omniroute/best-coding`):

```yaml
team:
  orchestrator:  { model: omniroute/best-coding }
  backend-dev:   { model: omniroute/best-coding }
  frontend-dev:  { model: omniroute/best-coding }
  qa:            { model: omniroute/best-coding }
  adversary:     { model: omniroute/best-coding }
  security:      { model: omniroute/best-coding }
  docs:          { model: omniroute/best-coding }
  architect:     { model: omniroute/best-coding }
```

Regenerate opencode config from the manifest, then check health:

```powershell
armada init --from-armada armada/armada.yaml --restart
armada doctor
```

armada owns only `provider.openrouter` in `opencode.json` and leaves your
existing `provider.omniroute` block intact, so the OmniRoute entry survives
re-scaffolding. You do not need an OpenRouter key unless you want the "power"
budget tier.

### 4.3 Use the fleet

```powershell
armada fleet     # dashboard of active lanes
armada voyage <feature>   # start a feature lane
```

---

## 5. Quick verification after each track

- buku.pro: `https://buku.pro` serves the 4 pages.
- mybuku: `node scripts/release_preflight_check.js` (13 pass / 0 fail) and the
  deployed Functions respond.
- Supabase: `npx supabase db push` reports "up to date" and
  `deno test tests/payment_reservation_flow.test.ts` passes.
- armada: `armada doctor` shows opencode + providers + model drift all green.
