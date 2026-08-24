<#
.SYNOPSIS
Deploy the static buku.pro site to Cloudflare Pages (more reliable than
GitHub Pages: global CDN, custom domain + HTTPS, preview deploys, and it
works from a private repo).

.PREREQUISITE (one-time, interactive)
  npx wrangler login
  # then create the project once:
  npx wrangler pages project create buku-pro --production-branch main

.EXAMPLE
  .\deploy-cloudflare.ps1
  .\deploy-cloudflare.ps1 -ProjectName buku-pro
#>
[CmdletBinding()]
param(
  [string]$ProjectName = "buku-pro",
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

Write-Host "Deploying site root to Cloudflare Pages project '$ProjectName'..."
npx wrangler pages deploy . --project-name $ProjectName --branch $Branch
if ($LASTEXITCODE -ne 0) { throw "wrangler pages deploy failed" }

Write-Host "Deploy complete."
Write-Host "Attach the custom domain in the Cloudflare dashboard:"
Write-Host "  Pages > buku-pro > Custom domains > buku.pro"
Write-Host "DNS: add a CNAME record  buku.pro -> $ProjectName.pages.dev  (or set a CNAME at your registrar)."
