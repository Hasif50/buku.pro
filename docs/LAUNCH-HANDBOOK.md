# buku.pro — Launch Handbook (human handoff)

Everything the code can do is already done and committed. The steps below are
the only ones that need **your accounts / credentials** — an agent cannot log in
for you. They're ordered; each is copy-pasteable.

## 0. State (already done, committed)

| Repo | Path | Status |
|---|---|---|
| buku.pro site | `G:\buku-pro` | built + design-complete, 15 commits |
| DentalOS AI | `G:\dentalos-ai` | full app, tested; Oracle self-host ready |
| myBuku | `G:\mybuku` | green: 343 Flutter tests + 82 functions tests + web build |
| Supabase pilot | `G:\mybuku\supabase` | reservation + settle verified |
| armada / opencode / OmniRoute | global | installed; opencode→OmniRoute verified |

---

## 1. Put buku.pro live (GitHub Pages — do this first)

**1.1 Create the repo**
1. Open https://github.com/new → name `buku-pro`, leave it empty (no README).
2. Copy the repo URL.

**1.2 Push (on this machine)**
```powershell
cd G:\buku-pro
git remote add origin git@github.com:<you>/buku-pro.git   # or the https URL
git push -u origin master
```

**1.3 Enable Pages**
1. Repo → **Settings → Pages → Source: GitHub Actions**.
2. Wait ~1 min; a workflow run deploys on the push. You'll see a green ✓ and a
   URL like `https://<you>.github.io/buku-pro/`.

**1.4 Point the domain**
1. Pages → **Custom domain** → enter `buku.pro` → Save (the `CNAME` file is
   already in the repo, so GitHub accepts it).
2. In your DNS provider (wherever `buku.pro` is registered), add:
   - 4 × `A` records (apex `buku.pro`) →
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` `www` → `<you>.github.io`
3. Wait for DNS + the TLS cert (can take up to a few hours). Verify
   `https://buku.pro`.

> The site has screenshot slots at `assets/screenshots/*.png`. Drop the real
> myBuku / Bukubiz / DentalOS screenshots there and they appear automatically.

---

## 2. DentalOS AI live (Oracle Always-Free — $0 forever)

DentalOS needs a long-running server (scheduler + SSE), so it runs on a VM.

**2.1 Create the VM (Oracle console, one time)**
1. https://cloud.oracle.com → sign in → **Compute → Instances → Create instance**.
2. Image **Ubuntu 22.04**, shape **VM.Standard.A1.Flex**, allocate **4 OCPU / 24 GB RAM**.
3. Download/save the **SSH private key**. Note the **public IP**.

**2.2 Provision the VM**
```powershell
# copy the provision script up, then run it over SSH
scp -i <key>.key G:\dentalos-ai\scripts\oracle-provision.sh ubuntu@<IP>:/tmp/
ssh -i <key>.key ubuntu@<IP> "bash /tmp/oracle-provision.sh"
```
Then, in the Oracle console, **open ports 80 and 443** in the VCN Security List
(Ingress, TCP, 0.0.0.0/0) — this is the step people miss; ufw alone isn't enough.

**2.3 Deploy the app**
```bash
# on the VM (log out/in first for the docker group)
git clone https://github.com/<you>/dentalos-ai.git && cd dentalos-ai
cp .env.example .env        # fill in DATABASE_URL is NOT needed for self-host; set POSTGRES_PASSWORD, SESSION_SECRET, etc.
docker compose -f docker-compose.oracle.yml up -d --build
```

**2.4 Point a subdomain**
- Edit `Caddyfile`: change `dentalos.buku.pro` to your app subdomain.
- DNS: `A` record for that subdomain → the VM's public IP.
- `docker compose -f docker-compose.oracle.yml restart caddy` for the TLS cert.

Verify `https://<subdomain>.buku.pro/api/ready` → `{"ok":true,...}`.

---

## 3. myBuku live (Firebase)

myBuku's backend is Firebase. Auth/Firestore/Storage stay free; **Functions
needs the Blaze plan (a card)**.

```powershell
npm install -g firebase-tools
firebase login
firebase use mybuku-d77f1
cd G:\mybuku

# backend (rules/indexes/storage/functions)
firebase deploy --only functions,firestore:rules,firestore:indexes,storage
# ^ will prompt to enable Blaze billing — accept, then set a Google Cloud
#   budget alert (Billing → Budgets & alerts → +Create budget, e.g. MYR 20/mo).

# web app
flutter build web --release `
  --dart-define=MYBUKU_PRIVACY_POLICY_URL=https://buku.pro/privacy `
  --dart-define=MYBUKU_TERMS_URL=https://buku.pro/terms `
  --dart-define=MYBUKU_SUPPORT_EMAIL=support@buku.pro
firebase deploy --only hosting
```
Then optionally attach `app.buku.pro` (Hosting → Add custom domain) and add the
Firebase DNS records.

---

## 4. Supabase pilot (free)

```powershell
npx supabase login
npx supabase projects create mybuku-pilot --region ap-southeast-1
cd G:\mybuku\supabase
npx supabase link --project-ref <ref>
npx supabase db push
npx supabase functions deploy agent-api finance-api ledger-api ocr-api payment-api market-api
npx supabase secrets set TOYYIBPAY_SECRET_KEY=... TOYYIBPAY_CATEGORY_CODE=...
```
This is a pilot, not the app's source of truth. See
`G:\mybuku\docs\supabase-free-tier-activation.md`.

---

## 5. armada fleet (already wired)

opencode is configured for OmniRoute (verified). To run the fleet on a repo:

```powershell
cd G:\dentalos-ai
armada init
# edit armada/armada.yaml → set each role's model to omniroute/best-coding
armada init --from-armada armada/armada.yaml --restart
armada doctor && armada voyage <feature>
```

---

## Suggested order & definition of done

1. **buku.pro** (section 1) — 5 minutes, free, no card.
2. **DentalOS** (section 2) — ~30 min, free forever, no card.
3. **myBuku** (section 3) — needs the Firebase Blaze card.
4. **Supabase** (section 4) — optional, free.

Each is independent; do them in any order. The only hard external dependency is
DNS propagation for the custom domains.
