# Cloudflare Tokens & Credentials Audit — cross-project (2026-09-01)

Scope: every buku.pro project that touches Cloudflare. Verified by reading
workflows, GitHub secrets listings (`gh secret list`), run histories, and the
authenticated local wrangler.

## Matrix

| Project | CF touchpoint | Workflow | Secrets in GitHub | Status |
|---|---|---|---|---|
| buku.pro (site) | Cloudflare Pages `buku-pro` (serves buku.pro) | `cloudflare-pages.yml` | **none** | ❌ workflow fails every run: `CLOUDFLARE_API_TOKEN` missing. Live site served by **local wrangler deploys** instead |
| mybuku (web) | Cloudflare Pages `mybuku` | `deploy-web-cloudflare.yml` | **none** | ❌/⚠️ last run cancelled after 24h hang; Firebase Hosting remains the working web path |
| myBuku BA | Cloudflare Tunnel `mybuku-ba` → ba.buku.pro | n/a (Windows service holds tunnel token) | n/a | ✅ live (service-managed) |
| bukubiz | R2 bucket `bukubiz-uploads` (uploads) | none | n/a | ⚠️ bucket exists; **zero consuming code**; `.env` lacks R2/S3 variables |
| Buku Lang / dentalos-ai / bukubiz-interconnect | none found | — | — | ✅ nothing to fix |

## Root cause

The two Pages workflows require repo secrets that were never created:

```
CLOUDFLARE_API_TOKEN   (token needs Cloudflare Pages: Edit + R2: Edit)
CLOUDFLARE_ACCOUNT_ID
```

`gh secret list` confirms neither exists in `Hasif50/buku.pro` or
`Hasif50/mybuku`. The failing runs are not transient — they cannot succeed
until the secrets exist.

## Fix (operator, ~5 minutes)

1. Cloudflare dashboard → My Profile → API Tokens → Create Token with
   **Cloudflare Pages: Edit** (+ **R2: Edit** if CI should manage buckets).
2. Note the **Account ID** (dashboard right sidebar).
3. For each repo (`Hasif50/buku.pro`, `Hasif50/mybuku`):
   ```
   gh secret set CLOUDFLARE_API_TOKEN -R <repo>
   gh secret set CLOUDFLARE_ACCOUNT_ID -R <repo>
   ```
4. Re-run the workflows (or push).

Until then, the **working deploy path is local wrangler** (authenticated on
this machine): `npx wrangler@3.90.0 pages deploy . --project-name buku-pro
--branch main` — verified working 2026-09-01.

## Decision needed

Either add the secrets (restores CI deploys) **or** delete/ignore the two CF
workflows and keep local deploys as the canonical path. Keeping both without
secrets leaves permanent red X's on every push.
