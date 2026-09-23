# Organization interview question bank

Fill `context/*.yaml` from these. Ask in batches of 3–5; skip what is
already known from the conversation or existing files. File names below
are the template defaults — adapt to the context files actually present.

## organization.yaml

- Legal entity name, and the short name used day-to-day?
- Primary website / email domain?
- Who formally approves policies (name + title)? When were policies last
  approved (or will the initial approval happen at first merge)?

## contacts.yaml (key roles)

For each role the templates reference — security lead, privacy officer,
IT admin — ask: name, title, email, GitHub username. One person may hold
several roles (common in small orgs); record the same person under each.
Ask who should be the default assignee for procedure tickets.

## branding.yaml

- Logo file (drop into `assets/`, update `logo_url`), favicon.
- Portal tagline / welcome message — offer a sensible default.
- Will the portal be public (trust portal) or internal-only? This decides
  the publishing workflow setup.

## config / scheduling

- Start of compliance (the date from which the scheduler should consider
  procedures due — usually "now" for a new program, or the audit-period
  start).
- Where should procedure tickets be created: this repo, or a separate
  ops/ticketing repo (`context/github.yaml` override)?

## Environment facts (used in narratives and later phases)

- What does the company sell / do? Main products or services?
- Where does production run (cloud provider(s), regions, on-prem)?
- Headcount and rough engineering size; fully remote, hybrid, offices?
- Identity provider / SSO? MFA enforced where?
- Source control, CI/CD, ticketing systems in use?
- Any existing certifications or past audits?
