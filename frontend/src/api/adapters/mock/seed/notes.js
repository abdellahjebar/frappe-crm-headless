export const NOTES = [
  // ── Acme Corp / LEAD-0001 ────────────────────────────────────────────────
  {
    name: 'NOTE-0001',
    title: 'Discovery call summary',
    content: '<p>John confirmed they are hitting scaling limits with their current CRM. Key pain points: slow load times on bulk imports, no API access on their plan, no multi-territory support.</p><p>Decision committee: John (IT), Linda Walsh (CFO), procurement TBD. Timeline: want to be live before Q3 planning cycle.</p>',
    reference_doctype: 'CRM Lead',
    reference_docname: 'LEAD-0001',
    owner: 'james.okafor@nexacrm.io',
    creation: '2024-01-12 11:00:00',
    modified: '2024-01-12 11:00:00',
  },
  {
    name: 'NOTE-0002',
    title: 'Proposal feedback',
    content: '<p>John reviewed the enterprise proposal. Positive response overall. Asked for a discount on seats above 200. Linda (CFO) wants to confirm the data migration scope before signing.</p><p>Follow-up: send revised proposal with migration estimate by 2024-01-26.</p>',
    reference_doctype: 'CRM Lead',
    reference_docname: 'LEAD-0001',
    owner: 'james.okafor@nexacrm.io',
    creation: '2024-01-22 14:30:00',
    modified: '2024-01-22 14:30:00',
  },

  // ── Meridian Finance / LEAD-0004 ─────────────────────────────────────────
  {
    name: 'NOTE-0003',
    title: 'Compliance requirements call',
    content: '<p>Aisha walked us through Meridian\'s compliance requirements. They need SOC 2 Type II documentation, data residency in US-East, and RBAC at the field level.</p><p>Sent compliance pack to their legal team. Awaiting sign-off from their DPO.</p>',
    reference_doctype: 'CRM Lead',
    reference_docname: 'LEAD-0004',
    owner: 'james.okafor@nexacrm.io',
    creation: '2024-02-10 10:00:00',
    modified: '2024-02-10 10:00:00',
  },

  // ── Vertex Systems / LEAD-0003 ───────────────────────────────────────────
  {
    name: 'NOTE-0004',
    title: 'Referral context — from CloudNest',
    content: '<p>Marcus was referred by Isabel Ferreira at CloudNest. They are evaluating us against Salesforce and HubSpot. Budget is approved for $80k ARR but wants to see a live demo with their actual data before committing.</p>',
    reference_doctype: 'CRM Lead',
    reference_docname: 'LEAD-0003',
    owner: 'sarah.chen@nexacrm.io',
    creation: '2024-01-25 09:30:00',
    modified: '2024-01-25 09:30:00',
  },

  // ── David Kim / LEAD-0007 (Quantum Biotech) ──────────────────────────────
  {
    name: 'NOTE-0005',
    title: 'Regulatory environment note',
    content: '<p>David flagged that Quantum Biotech operates in a regulated space (clinical trial data). Any CRM storing linked patient metadata must pass their internal security review — 8-week process.</p><p>Not a blocker for non-clinical workflows. Propose scoped pilot for their BD team first.</p>',
    reference_doctype: 'CRM Lead',
    reference_docname: 'LEAD-0007',
    owner: 'sarah.chen@nexacrm.io',
    creation: '2024-03-10 15:00:00',
    modified: '2024-03-10 15:00:00',
  },

  // ── Acme Corp Enterprise / DEAL-0001 ─────────────────────────────────────
  {
    name: 'NOTE-0006',
    title: 'Negotiation notes',
    content: '<p>John is pushing for 20% off on the 250-seat enterprise plan. CFO Linda approved budget up to $44k. We have margin to go to $42k with the migration included.</p><p>Counter-offer strategy: hold price, include free migration + 90-day onboarding support.</p>',
    reference_doctype: 'CRM Deal',
    reference_docname: 'DEAL-0001',
    owner: 'james.okafor@nexacrm.io',
    creation: '2024-04-15 11:00:00',
    modified: '2024-04-15 11:00:00',
  },
  {
    name: 'NOTE-0007',
    title: 'Technical requirements from IT',
    content: '<p>IT team sent over integration requirements: SSO via Okta, webhook support for their internal ticketing system, read-only API access for their data warehouse (Snowflake).</p><p>All three are supported. Sent technical spec doc to their architect.</p>',
    reference_doctype: 'CRM Deal',
    reference_docname: 'DEAL-0001',
    owner: 'james.okafor@nexacrm.io',
    creation: '2024-05-02 14:00:00',
    modified: '2024-05-02 14:00:00',
  },

  // ── Meridian Finance Compliance Suite / DEAL-0003 ────────────────────────
  {
    name: 'NOTE-0008',
    title: 'Discount approval from management',
    content: '<p>Escalated 15% discount request to Sarah. Approved at 12% on the annual plan — $105,600. Aisha accepted verbally on the 2024-05-10 call. Contract being prepared by legal.</p>',
    reference_doctype: 'CRM Deal',
    reference_docname: 'DEAL-0003',
    owner: 'james.okafor@nexacrm.io',
    creation: '2024-05-11 09:00:00',
    modified: '2024-05-11 09:00:00',
  },

  // ── CloudNest Startup Package / DEAL-0005 ────────────────────────────────
  {
    name: 'NOTE-0009',
    title: 'Startup pricing breakdown sent',
    content: '<p>Isabel confirmed the startup package ($18k/year for 3 years) works within their seed budget. Legal reviewing standard SaaS agreement — no custom clauses expected.</p><p>On track for close by July 1st.</p>',
    reference_doctype: 'CRM Deal',
    reference_docname: 'DEAL-0005',
    owner: 'lucas.martin@nexacrm.io',
    creation: '2024-06-10 10:00:00',
    modified: '2024-06-10 10:00:00',
  },

  // ── Apex Infrastructure Field Ops / DEAL-0011 ────────────────────────────
  {
    name: 'NOTE-0010',
    title: 'Procurement process — 3 vendor quotes required',
    content: '<p>Ravi confirmed procurement policy requires 3 vendor quotes above $50k. We are one of three shortlisted. The other two are Salesforce (Field Service) and a local integrator.</p><p>Differentiators to emphasise: open API, no per-seat field costs, mobile-first offline mode.</p>',
    reference_doctype: 'CRM Deal',
    reference_docname: 'DEAL-0011',
    owner: 'sarah.chen@nexacrm.io',
    creation: '2024-06-12 13:00:00',
    modified: '2024-06-12 13:00:00',
  },

  // ── Pinnacle Solutions (Closed Won) / DEAL-0007 ──────────────────────────
  {
    name: 'NOTE-0011',
    title: 'Post-close onboarding notes',
    content: '<p>Kickoff completed 2024-06-03. Elena assigned as primary admin. 3 power users identified for advanced training. Data migration from their legacy system (SugarCRM) completed over the weekend — 4,200 contacts imported cleanly.</p>',
    reference_doctype: 'CRM Deal',
    reference_docname: 'DEAL-0007',
    owner: 'priya.sharma@nexacrm.io',
    creation: '2024-06-04 09:00:00',
    modified: '2024-06-04 09:00:00',
  },
]
