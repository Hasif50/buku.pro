<#
.SYNOPSIS
Deploy the buku.pro static site to Cloudflare Pages.

.DESCRIPTION
Uploads the current directory to Cloudflare Pages (no build step: this is a
static site). Requires npx (wrangler auto-installed) and a one-time
`npx wrangler login`.

.EXAMPLE
  .\deploy.ps1
#>
$ErrorActionPreference = "Stop"
npx wrangler pages deploy . --project-name buku-pro
if ($LASTEXITCODE -ne 0) { throw "wrangler pages deploy failed" }
Write-Host "Deployed. Attach buku.pro in the Cloudflare Pages Custom Domains tab."
