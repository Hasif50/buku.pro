/** GET /admin — dashboard (authenticated) or login form. */
import { ADMIN_COOKIE, cookieHeader, escapeHtml, fetchText, html, loginPage, verifyCookie, type EnvLike, type Probe } from "./_lib.js";

async function dentalosProbes(base: string, metricsToken?: string): Promise<Probe[]> {
  const probes: Probe[] = [];
  try {
    const r = await fetchText(`${base}/api/ready`);
    probes.push({ name: "DentalOS /api/ready", detail: `HTTP ${r.status} ${escapeHtml(r.text.slice(0, 60))}`, ok: r.status === 200 });
  } catch (e) {
    probes.push({ name: "DentalOS /api/ready", detail: `unreachable: ${escapeHtml((e as Error).message)}`, ok: false });
  }
  try {
    const { status, text } = await fetchText(`${base}/api/metrics`, metricsToken);
    if (status !== 200) {
      probes.push({ name: "DentalOS /api/metrics", detail: `HTTP ${status}`, ok: false });
      return probes;
    }
    const value = (name: string): number | null => {
      const l = text.split("\n").find((line) => line.startsWith(name + " "));
      return l ? Number(l.split(/\s+/).pop()) : null;
    };
    const scheduler = value("dentalos_scheduler_running");
    const sweep = value("dentalos_scheduler_sweep_running");
    const llm = value("dentalos_llm_configured");
    const costReady = value("dentalos_llm_cost_attribution_ready");
    const rls = value("dentalos_rls_runtime_ready");
    probes.push({ name: "Scheduler loop", detail: `${scheduler === 1 ? "running" : "NOT running"} (sweep ${sweep === 1 ? "active" : "idle"})`, ok: scheduler === 1 });
    probes.push({ name: "LLM provider configured", detail: llm === 1 ? "yes" : "no", ok: llm === 1 });
    probes.push({ name: "Cost attribution", detail: costReady === 1 ? "ready" : "degraded", ok: costReady === 1 });
    probes.push({ name: "RLS runtime pilot", detail: rls === null ? "not reported" : rls === 1 ? "ready" : "off/degraded", ok: true });

    const ratios: string[] = [];
    let totalCost = 0;
    for (const line of text.split("\n")) {
      const c = line.match(/^dentalos_llm_cost_usd\{org_id="([^"]+)"\}\s+(\S+)/);
      if (c) totalCost += Number(c[2]);
      const b = line.match(/^dentalos_llm_budget_used_ratio\{org_id="([^"]+)"\}\s+(\S+)/);
      if (b && Number(b[2]) > 0) ratios.push(`${b[1]}: ${Math.round(Number(b[2]) * 100)}%`);
    }
    probes.push({ name: "Month-to-date LLM spend", detail: `$${totalCost.toFixed(2)} across attributed orgs`, ok: true });
    probes.push({
      name: "Budget usage",
      detail: ratios.length ? ratios.join(" · ") : "no USD budgets set",
      ok: ratios.every((r) => parseInt(r, 10) < 90),
    });
  } catch (e) {
    probes.push({ name: "DentalOS /api/metrics", detail: `unreachable: ${escapeHtml((e as Error).message)}`, ok: false });
  }
  return probes;
}

async function renderDashboard(env: EnvLike): Promise<Response> {
  const sections: string[] = [];

  let leadsRows = "";
  let leadCount = 0;
  try {
    const leads = (env as { LEADS?: KVNamespace }).LEADS;
    if (!leads) throw new Error("LEADS binding missing");
    const list = await leads.list({ prefix: "lead:" });
    leadCount = list.keys.length;
    for (const k of list.keys) {
      const v = await leads.get(k.name);
      if (!v) continue;
      const lead = JSON.parse(v) as { email: string; name?: string; source?: string; ts: string };
      leadsRows += `<tr><td>${escapeHtml(lead.ts)}</td><td>${escapeHtml(lead.email)}</td><td>${escapeHtml(lead.name ?? "")}</td><td>${escapeHtml(lead.source ?? "")}</td></tr>`;
    }
    sections.push(
      `<div class="card"><h2>Funnel leads (${leadCount})</h2><table><tr><th>ts</th><th>email</th><th>name</th><th>source</th></tr>${leadsRows || '<tr><td colspan="4">no leads yet</td></tr>'}</table></div>`,
    );
  } catch (e) {
    sections.push(`<div class="card"><h2>Funnel leads</h2><p class="bad">unavailable: ${escapeHtml((e as Error).message)}</p></div>`);
  }

  const probes: Probe[] = await dentalosProbes("https://dentalos.buku.pro", env.METRICS_TOKEN);
  try {
    const gw = await fetchText("https://bukubiz-gateway.bukubiz.workers.dev/leads");
    probes.push({ name: "Interconnect gateway /leads", detail: `HTTP ${gw.status} (401/503 = alive, gated)`, ok: [401, 503].includes(gw.status) });
  } catch (e) {
    probes.push({ name: "Interconnect gateway", detail: `unreachable: ${escapeHtml((e as Error).message)}`, ok: false });
  }
  probes.push({ name: "myBuku", detail: "Flutter + Firestore — not deployed (no API to probe)", ok: true });
  probes.push({ name: "buku.pro", detail: "this site — serving", ok: true });

  const probeHtml = probes
    .map((p) => `<div class="row ${p.ok ? "ok" : "bad"}"><span>${escapeHtml(p.name)}</span><span class="detail">${escapeHtml(p.detail)}</span></div>`)
    .join("");
  sections.push(`<div class="card"><h2>Services & DentalOS</h2>${probeHtml}</div>`);

  return html(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bukubiz Admin</title><style>
body{font-family:system-ui;background:#0d1224;color:#e8ecf5;margin:0;padding:24px}
h1{margin:0 0 4px}.sub{color:#8a93ad;font-size:.85rem;margin-bottom:20px}
.card{background:#131a2e;border:1px solid #2a3350;border-radius:12px;padding:20px;margin-bottom:18px;overflow-x:auto}
h2{margin:0 0 12px;font-size:1.05rem}
table{width:100%;border-collapse:collapse;font-size:.85rem}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #222b45}
.row{display:flex;justify-content:space-between;gap:16px;padding:7px 4px;border-bottom:1px solid #222b45;font-size:.9rem}
.row .detail{color:#8a93ad;text-align:right}.ok{border-left:3px solid #3fbf7f;padding-left:10px}.bad{border-left:3px solid #e05f5f;padding-left:10px}
a{color:#d4af37}a.logout{font-size:.8rem;color:#8a93ad}
</style></head><body>
<h1>Bukubiz Admin</h1>
<p class="sub">Portfolio operator console · generated ${new Date().toISOString()} · <a class="logout" href="/admin/logout">log out</a></p>
${sections.join("\n")}
</body></html>`);
}

export const onRequestGet: PagesFunction = async (context) => {
  const env = context.env as EnvLike;
  const cookies = cookieHeader(context.request);
  const ok = await verifyCookie(cookies[ADMIN_COOKIE], env.ADMIN_DASHBOARD_TOKEN ?? "");
  if (!ok) {
    const url = new URL(context.request.url);
    return loginPage(url.searchParams.has("error"));
  }
  return renderDashboard(env);
};
