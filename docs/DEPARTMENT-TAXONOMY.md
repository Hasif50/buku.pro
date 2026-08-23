# Bukubiz — Department Taxonomy & Code Classification

The canonical way to organize **agentic services** across every repo. This is
the "reclassification" standard: components, modules, and routes are grouped by
the six business departments plus a shared platform core.

## The six departments + their agentic services

| # | Department | Agentic services (what its agents do) |
|---|---|---|
| 01 | **Marketing** | campaigns, content, customer outreach, recall/retargeting, brand reporting |
| 02 | **Finance** | invoicing, expense tracking, cash flow, reconciliation, reporting |
| 03 | **HR** | onboarding, leave, payroll, staff records, compliance |
| 04 | **Operations** | inventory, procurement, scheduling, logistics, day-to-day running |
| 05 | **Sales** | pipeline, follow-ups, deal tracking, quoting, forecasting |
| 06 | **Admin** | records, compliance, reporting, support, audit |

## Shared platform core (cross-department, not per-department)

Auth/identity · tenant isolation · agent runtime + tool registry · ledger ·
knowledge base · audit log · billing · notifications. These are `core/`, not
`departments/<x>/`.

## Folder / component convention

For apps, group by department first, core second:

```
src/
├── core/                  # auth, tenant, agent-runtime, ledger, audit
├── departments/
│   ├── marketing/         # agents, tools, services, UI for Marketing
│   ├── finance/
│   ├── hr/
│   ├── operations/
│   ├── sales/
│   └── admin/
└── ...
```

For marketing sites, mirror the same six departments as sections/components
(e.g. a "Services" or "Agents" section lists the six departments, each with its
agentic services) — never generic one-off service names.

## Naming convention

- Prefix department names: `FinanceAgent`, `MarketingDashboard`,
  `SalesService`, `OpsTool`.
- Agentic verbs are consistent: agents *draft, reconcile, schedule, flag, track,
  report* — never "do stuff".
- Use the six department names exactly (Marketing, Finance, HR, Operations,
  Sales, Admin) — no synonyms ("HR" not "People", "Operations" not "Ops" in
  visible copy; in code `ops` is acceptable).

## Applying the standard to a repo

1. Identify which code is department-specific vs core.
2. Move department-specific components/services/routes under the matching
   department folder (or rename with the department prefix).
3. Keep core (auth/tenant/agent-runtime/ledger/audit) shared.
4. In visible copy, list services per the six departments with their agentic
   services, landing on "AI that works for you".
5. Use the brand tokens (see `BRAND-STANDARD.md`) — ink/vellum/gold/starlight,
   no purple.
