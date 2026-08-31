/** Shared helpers for the /admin operator console (underscore = not routed). */

export const ADMIN_COOKIE = "buku_admin";
export const COOKIE_TTL_MS = 12 * 60 * 60 * 1000;

export type EnvLike = Record<string, string | undefined>;

export async function signExpiry(exp: number, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(String(exp)));
  return `${exp}.${Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export async function verifyCookie(cookieValue: string | undefined, secret: string): Promise<boolean> {
  if (!cookieValue) return false;
  const dot = cookieValue.indexOf(".");
  if (dot <= 0) return false;
  const exp = Number(cookieValue.slice(0, dot));
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = await signExpiry(exp, secret);
  return cookieValue === expected;
}

export function cookieHeader(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (req.headers.get("cookie") ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const STYLE = `
body{font-family:system-ui;background:#0d1224;color:#e8ecf5;margin:0;padding:24px}
h1{margin:0 0 4px}.sub{color:#8a93ad;font-size:.85rem;margin-bottom:20px}
.card{background:#131a2e;border:1px solid #2a3350;border-radius:12px;padding:20px;margin-bottom:18px;overflow-x:auto}
h2{margin:0 0 12px;font-size:1.05rem}
table{width:100%;border-collapse:collapse;font-size:.85rem}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #222b45}
.row{display:flex;justify-content:space-between;gap:16px;padding:7px 4px;border-bottom:1px solid #222b45;font-size:.9rem}
.row .detail{color:#8a93ad;text-align:right}.ok{border-left:3px solid #3fbf7f;padding-left:10px}.bad{border-left:3px solid #e05f5f;padding-left:10px}
a{color:#d4af37}a.logout{font-size:.8rem;color:#8a93ad}
input{width:100%;box-sizing:border-box;padding:10px;border-radius:8px;border:1px solid #2a3350;background:#0d1224;color:inherit}
button{width:100%;margin-top:12px;padding:10px;border-radius:8px;border:0;background:#d4af37;color:#131a2e;font-weight:600;cursor:pointer}
.err{color:#e08f8f;margin-bottom:10px;font-size:.9rem}`;

export function html(body: string, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex", "cache-control": "no-store", ...extraHeaders },
  });
}

export function loginPage(error: boolean): Response {
  return html(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bukubiz Admin</title><style>${STYLE}</style></head><body>
<div class="card" style="max-width:340px;margin:0 auto;margin-top:18vh"><h1 style="margin:0 0 4px">Bukubiz Admin</h1>
<p style="margin:0 0 16px;font-size:.85rem;color:#8a93ad">Portfolio operator console</p>
${error ? '<p class="err">Invalid token.</p>' : ""}
<form method="post" action="/admin/login"><input type="password" name="token" placeholder="Operator token" autofocus required>
<button type="submit">Sign in</button></form></div></body></html>`,
    error ? 401 : 200,
  );
}

export interface Probe {
  name: string;
  detail: string;
  ok: boolean;
}

export async function fetchText(url: string, token?: string): Promise<{ status: number; text: string }> {
  const res = await fetch(url, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(8000),
  });
  return { status: res.status, text: await res.text() };
}
