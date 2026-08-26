---
name: setup-compliance-program
description: Set up a new push-to-comply compliance program, or update an existing one, through a guided interview - choose a template, scaffold the repo, tailor context/policies/narratives to the organization's real practices, and verify coverage. Use when someone wants to start a compliance program, prepare for SOC 2 or another framework, or bring their push-to-comply program up to date.
---

Walk the user from nothing (or an existing program) to a working,
truthful compliance program. Interview in small batches — a few questions
at a time, never a wall of questions.

## Phase 0 — Orient

Determine which situation applies and confirm it with the user:

- **New program** → continue from Phase 1.
- **Existing program repo** (has `controls/` + `context/`) → skip to
  Phase 3 and operate in update mode: diff what exists against the
  interview instead of starting fresh.

Also establish: which framework(s) matter now (SOC 2? NIST? customer
questionnaires?), who will own the program, and whether they work mainly
in a terminal or in the GitHub UI.

## Phase 1 — Scaffold

1. Requires Node 22+ and the `push-to-comply` package
   (`npm install -g push-to-comply`, or `npx`).
2. Show the available templates (`ptcomply init --list`) and recommend one
   for their framework; a consultant-provided or private template
   repository also works via `--template <repo>`.
3. Scaffold:
   `ptcomply init <dir> --template <choice> --name "<Org Name>" --short-name <Short>`
4. In the new repo: `npm install`, then `npx ptcomply build` and open
   `public/index.html` so they see the portal immediately. Create the
   GitHub repository (usually private) and push.

## Phase 2 — Organization context

Interview and fill `context/*.yaml` (see
[references/organization-interview.md](references/organization-interview.md)
for the question bank). Everything entered here flows into every document
via Handlebars macros, so get it right once. Verify with
`npx ptcomply build` (strict mode surfaces missing values).

## Phase 3 — Tailor policies to reality

This is the phase that decides whether the audit goes well. **The cardinal
rule: documents must describe what the organization actually does, not
what sounds good — auditors test what is written.**

For each policy (see
[references/policy-interview.md](references/policy-interview.md) for
per-policy questions):

1. Ask what the org's real practice is.
2. Edit the policy to match. Where template text overpromises (e.g.
   "reviews occur monthly" when they don't), either weaken the text to
   the truth or flag it as a practice gap the org must decide to adopt —
   record undecided items in a tracked list for the owner.
3. Keep `satisfies` mappings honest: if a policy no longer does what a
   criterion needs, remove the mapping and note the gap.

Narratives (`controls/narratives/`) are rewritten, not tweaked — they
describe *this* organization: products, architecture, security posture,
org structure. Interview for facts, then draft for the user's review.

Procedures: confirm each template procedure's schedule and assignees are
real; delete procedures the org won't run; add ones they already do
(access reviews, patch cycles, backup checks). Recommend `automation`
blocks (mode: assist) for evidence-gathering procedures.

## Phase 4 — Verify and hand off

1. `npx ptcomply validate` and `npx ptcomply build` must pass;
   `npx ptcomply gaps` per target standard — review remaining gaps with
   the user and record a plan for each (document, adopt practice, or
   accept).
2. Confirm the GitHub workflows are active (site publishing choice,
   ticket scheduler, optional agent procedures — these need repo
   secrets/variables the user must set).
3. Explain the operating rhythm: content changes via PR (that history is
   approval evidence), tickets are closed by humans as sign-off, and
   audits run in a separate evidence repository (point them to
   docs/evidence-architecture.md in the engine repo when an audit
   approaches).
4. Leave a written summary in the repo (e.g. `SETUP-NOTES.md` or issues):
   decisions made, gaps deferred, and next steps.
