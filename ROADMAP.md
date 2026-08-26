# push-to-comply Roadmap

The original premise — compliance artifacts in git, reviews as pull
requests, evidence as issue history — has aged remarkably well. It is
exactly the substrate that agentic tooling wants: plain text, structured
metadata, an audit trail for free. This document records what has shipped,
the decisions that shape the project, and what comes next.

## Decisions

These are settled and explain the shape of everything below.

### Naming

- **npm package: `push-to-comply`. CLI binary: `ptcomply`.** The package
  keeps the project's brand; the binary is short, unambiguous, and free of
  conflicts (`comply` and `complyctl` are already claimed by other tools in
  or near this space). Package and bin names are independent in npm, so we
  get both.

### Standards data

- **OSCAL is the strategic machine-readable format.** The OpenControl
  schemas this project originally referenced are dormant; NIST OSCAL is
  official, actively maintained, and its catalogs (SP 800-53 rev5 et al.)
  are public domain — drop the JSON into `standards/` and it works.
  opencontrol-style YAML/markdown standards remain supported.
- **Licensing rules:** NIST publications are public domain and safe to
  commit. The SOC 2 TSC is AICPA-copyrighted with no official
  machine-readable form — ship paraphrased criterion summaries only
  (as `standards/tsc-2017.md` does). No verbatim ISO 27001 or CIS text.

### Engine vs. content

- **The engine and the content are separate artifacts.** The engine is the
  `push-to-comply` npm package (in `packages/push-to-comply`): renderer,
  scheduler, OSCAL converter, `ptcomply` CLI, and the default
  layouts/assets. A compliance program repository contains only content —
  `controls/`, `standards/`, `context/`, branding — plus thin workflows
  calling the CLI. Engine upgrades are a version bump, never a template
  merge; a program's git history contains only compliance changes, which is
  itself better audit evidence.
- **Defaults with overlay:** layouts and assets ship inside the engine; a
  content repo overrides any of them by creating a same-named file under
  its own `layouts/` or `assets/`. Content repos need no layouts at all.
- This repository is the monorepo: engine under `packages/`, and the root
  is the reference content template, consuming the engine via npm
  workspaces exactly as clients will consume the registry package.

### Distribution and the template ecosystem

- **Templates live in git, not in the CLI.** The engine embeds no
  compliance content. `ptcomply init <dir>` scaffolds a new program by
  cloning a **template repository** — any git repo with `controls/`,
  `standards/`, `context/`. A curated registry is published at the
  well-known location `templates.json` on this repo's main branch;
  `--template` accepts owner/repo shorthand, any git URL, or a local path,
  and private templates work automatically because cloning uses the user's
  own git credentials. Third parties (consultants, industry groups) can
  build and share templates — public or private — with no relationship to
  this project beyond the content layout. Different templates can target
  different standard sets.
- **Three on-ramps, one artifact:** `ptcomply init` (personalized: fresh
  history starting at the client's first commit, org context rewritten);
  GitHub "Use this template" / plain clone for GitHub-centric teams; and
  crucially, **clone-only operation is complete without local tooling** —
  the bundled workflows install the engine in CI, so editing markdown in
  the GitHub UI and merging PRs yields the portal, gap analysis, and
  ticket scheduler. The locally-installed CLI adds preview, gap checks,
  and a driver for the org's own automation (evidence collection, account
  reviews, agents).
- **Pre-publish testing:** the first npm publish happens only after the
  full client journey has been rehearsed from a packed tarball —
  `npm pack --workspace push-to-comply`, global install, `ptcomply init`
  from a template, dependency installed from the tarball, `build` and
  `gaps` green. This flow is documented in the README and exercised by
  tests.

### Evidence and assessments

- **Evidence lives in separate, engagement-scoped repositories** (e.g.
  `evidence-2026-soc2`), never in the program repo. Reasons: access
  control is repo-granular and evidence (transcripts, emails, exports) is
  far more sensitive than policies; retention policies require deleting
  evidence, and git history can only forget by rewriting — which would
  destroy the program repo's approval trail; engagements are annual while
  the program is continuous, so evidence repos can be archived or purged
  whole; and the program repo stays small and clonable forever.
- **Conventional layout** for an evidence repo: `requests/` (auditor
  request list with status front-matter), `inbox/` (raw dumps for agent
  triage), `evidence/<id>/` (curated artifacts), `observations/` (gaps,
  findings, remediations with status/owner/due front-matter), `runbooks/`
  (org-specific collection instructions), plus `AGENTS.md` and agent
  skills.
- **One linking vocabulary:** evidence items declare what they support
  with the same shape as `satisfies` — e.g.
  `supports: {TSC: [CC6.1], controls: [policies/access]}` — plus
  engagement, source, date, collector. This is what lets tooling cross
  reference evidence against `compliance.json`.
- **Observations bridge back to the program:** a finding graduates into
  the content repo as a PR — a corrected policy or, better, a new `cron`
  procedure. The goal of each engagement is to convert one-off evidence
  hunts into scheduled procedures, so the ticket scheduler generates
  dated, assigned, closed-with-artifacts evidence all year and the next
  audit becomes mostly retrieval. The engagement-close retrospective
  (promote painful requests to procedures, update runbooks) is a named
  step.
- **Scope boundary:** push-to-comply provides the conventions, an
  evidence-repo template, the coverage crosswalk, and skills — never
  auditor-portal or assessment-management logic. An org's own portal
  integration (e.g. a local MCP server for their auditor's portal) plugs
  in beside these conventions.

### Agent enablement

Three layers, matched to where knowledge is needed:

1. **`AGENTS.md` in every repository** (program and evidence): ambient,
   tool-agnostic guidance — layout, strict-Handlebars gotchas, licensing
   rules, validation commands.
2. **Operating skills shipped inside template repos** (`.claude/skills/`):
   post-setup workflows — add-a-policy, map-controls, run-procedure,
   quarterly-review; for evidence repos: triage-inbox, draft-evidence,
   log-observation, engagement-retrospective. They version with the
   content they describe, and template authors ship their own.
3. **A published onboarding skill** distributed from this repo via a
   plugin marketplace: triggers on "set up a compliance program", walks
   template selection, runs `ptcomply init`, then conducts the interview —
   org facts into `context/*.yaml`, per-policy question banks that edit
   policies to match actual practice (never let aspirational boilerplate
   through — auditors test what you wrote), narrative interviews — then
   `build` + `gaps` and GitHub setup. Re-runs diff existing content
   against the question bank to update a program.
- Skills drive the `ptcomply` CLI directly; an MCP server comes later for
  surfaces without a shell. **Invariant for agent-executed work: the agent
  never closes its own ticket** — a human reviews posted evidence and
  closes, so closure remains sign-off.

## Shipped (this branch)

- **Fixes and reliability:** manual procedure trigger crash (missing
  import), YAML standards loader crash and wrong output path, broken
  `satisfies` → standard hyperlinks (pages now also published under their
  mapping key), cron-parser private API usage, markdown-extension regex,
  Chromium-only `computedStyleMap`, Handlebars pre-escaping markdown
  bodies (backticks/quotes never rendered), nonexistent JS handler on the
  folder page, per-procedure failure isolation in the scheduler with a
  failing exit code, scheduled tickets for procedures with
  `dynamic_fields` no longer break strict rendering, offline-safe
  `DRY_RUN`.
- **Test suite and CI:** `node:test` suites for the engine (self-contained
  against bundled fixtures, including CLI end-to-end) and template
  integration; CI workflow; Node pinned to 22 (`.nvmrc`, workflows,
  `engines`).
- **OSCAL support:** drop NIST OSCAL JSON catalogs into `standards/`;
  groups → families, enhancements included, withdrawn controls excluded,
  organization-defined parameters rendered as readable labels. Verified
  against the real SP 800-53 rev 5.2 catalog (1,014 criteria).
- **Machine-readable outputs:** `public/compliance.json` — per-criterion
  coverage, per-family stats, gap lists, full control index — plus
  `ptcomply gaps [--standard] [--json] [--fail-on-gaps]` as a CI coverage
  gate.
- **Portal redesign:** token-based stylesheet (light/dark), validated
  accessible palette (status always icon + label, never color alone),
  inline SVG icons replacing the CDN icon font (private/air-gapped portals
  render fully offline), standards coverage cards, stat tiles, family
  meters, satisfied/gap badges, GitHub-style task lists, print styles.
- **Engine/content split** as decided above, with the `ptcomply` CLI
  (`init`, `build`, `procedures`, `gaps`, `version`).
- **`ptcomply init`** with the template-registry model as decided above;
  `templates.json` established at the well-known location.
- **Agent-readiness groundwork:** `AGENTS.md` / `CLAUDE.md` in this repo.
- **`ptcomply validate`:** satisfies mappings checked against known
  standards and criterion ids (plus automation-block checks), wired into
  CI — and it immediately caught five policies mapped to a nonexistent
  TSC criterion (CC9.9), now corrected.
- **Agent-executed procedures:** `automation` front-matter
  (assist/execute), Agent Instructions ticket section with a
  machine-readable marker, `automation:agent` label, an opt-in
  claude-code-action workflow, a working Monthly Access Review example,
  and the never-closes-its-own-ticket invariant in ticket text and
  prompts.
- **Evidence architecture shipped:** `docs/evidence-architecture.md`,
  `ptcomply evidence coverage` (criteria without evidence, unknown
  references, engagement filter, `--fail-on-missing`), and the evidence
  template (`templates/evidence/`) with requests/inbox/evidence/
  observations/runbooks and four agent skills.
- **Three-layer agent enablement shipped:** operating skills in the
  program template (`add-policy`, `map-controls`, `run-procedure`),
  evidence-repo skills, and the `ptcomply` plugin
  (`setup-compliance-program` onboarding interview with question-bank
  references) behind a marketplace manifest.
- **Release machinery:** URLs point at the `push-to-comply` org,
  tag-triggered npm publish workflow, `scripts/export-repos.mjs`
  (clean-history template exports, covered by tests), and RELEASING.md.

## Next up (user-owned release steps — see RELEASING.md)

Everything below is prepared and rehearsed in-repo; what remains requires
the org owner:

1. Create the `push-to-comply` org repositories and push: the monorepo
   (clean history via an orphan branch if desired), then the exported
   `soc2-template` and `evidence-template` (`node scripts/export-repos.mjs`
   generates them with fresh single-commit histories; mark both as GitHub
   template repositories).
2. Publish the engine to npm: `npm publish --workspace push-to-comply
   --access public` locally, or set the `NPM_TOKEN` secret and push a
   `v*` tag to trigger the release workflow.
3. Verify the public paths (registry-driven `init`, plugin marketplace
   install, clone-only CI) per RELEASING.md step 4.

## Near term

- **Review metadata from git:** derive `approval_date`/approver from PR
  merge history instead of hand-edited front-matter; render "last
  reviewed" and flag documents unreviewed for N months as gaps.
- **Procedure evidence linking:** verify each generated ticket was closed
  with evidence attached; surface overdue/never-executed procedures in
  `compliance.json`.
- **Replace the browser PAT flow:** the trigger-procedure form stores a
  GitHub token in `localStorage`; replace with a GitHub App or
  device-flow helper.

## Agentic direction

- **MCP server** (`ptcomply mcp`): `list_gaps`, `get_control`,
  `draft_policy(criteria)`, `trigger_procedure`, `procedure_history` over
  the existing lib API. Stdio-first — launched via `npx push-to-comply
  mcp` with a checked-in `.mcp.json` in templates, so a fresh clone is
  agent-ready with zero setup and zero hosting; a remote (streamable
  HTTP) deployment stays an org-hosted option, consistent with the
  non-SaaS model. Complements skills: skills carry procedure, MCP carries
  actions for shell-less surfaces (e.g. claude.ai chat).
- **Drafting assistance:** "we adopted framework X; draft the missing
  policies mapped to the gap list" — the `gaps --json` output is the
  natural input.
- **Auditor Q&A:** the portal plus `compliance.json` (plus evidence-repo
  conventions) make a clean corpus for an auditor-facing agent answering
  "show me the control and evidence for CC6.1" with links.

## Later

- Additional ticket adapters (Jira, Linear) via the existing adapter seam.
- Additional OSCAL artifacts: import profiles/baselines (Low/Moderate/
  High); export an OSCAL SSP or component definition generated from the
  controls.
- Multi-framework cross-walks (one control satisfying TSC + 800-53 + CSF
  via published mapping tables, e.g. NIST CPRT exports).
- Portal extras, all still static: client-side search (Pagefind), a
  dashboard page fed by `compliance.json`, PDF binder export for
  auditors.
