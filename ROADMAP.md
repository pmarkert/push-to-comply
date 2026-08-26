# push-to-comply Modernization Roadmap

The original premise — compliance artifacts in git, reviews as pull requests,
evidence as issue history — has aged remarkably well. It is exactly the shape
that agentic tooling wants: plain text, structured metadata, an audit trail
for free. This roadmap captures where to take the project next.

## Done (tranche 1)

- Fixed crashing bugs (manual procedure trigger, YAML standards loader,
  cron-parser private API usage, broken `satisfies` → standard hyperlinks).
- Test suite (`node:test`) + CI workflow; Node version pinned (22).
- OSCAL catalog support: drop public-domain NIST catalogs (e.g. SP 800-53
  rev5) into `standards/` as JSON.
- `public/compliance.json` — machine-readable coverage snapshot with gap
  lists, for agents and dashboards.
- `AGENTS.md` / `CLAUDE.md` so coding agents can operate the repo correctly.
- Offline-safe `DRY_RUN` mode for the scheduler.
- Portal UI redesign: token-based stylesheet, light/dark, inline SVG icons
  (no CDN), coverage cards/stat tiles/gap badges, print styles.
- Engine/content split: the engine is now the `push-to-comply` npm package
  (CLI `ptcomply`: `build`, `procedures`, `gaps`) under
  `packages/push-to-comply`, carrying the default layouts/assets; the repo
  root is the content template consuming it via npm workspaces. Next step:
  publish to npm, then content repos depend on the registry package.

## Near term

- `ptcomply init`: scaffold new programs from template repositories (no
  content embedded in the engine) — curated registry in `templates.json`,
  owner/repo shorthand, private repos via the user's git auth, local paths.
  The full pre-publish client journey (global tarball install → init →
  install → build/gaps) is exercised by tests and rehearsal.
- **Publish the engine to npm** and create `push-to-comply-template` (the
  root content minus `packages/`, dependency pointed at the registry),
  listed in `templates.json`; optionally mirror it automatically on release.
- **Schema validation**: validate front-matter (`satisfies` keys reference a
  known standard, criteria ids exist, `dynamic_fields` declared for every
  macro) as a test/CI step — catch mapping typos before an auditor does.
- **Review metadata**: derive `approval_date`/`approver` from git/PR history
  instead of hand-edited front-matter; render "last reviewed" and flag
  stale documents (e.g. policies not reviewed in 12 months) as gaps.
- **Procedure evidence linking**: close-the-loop check that each generated
  ticket was closed with evidence attached; surface overdue/never-executed
  procedures in compliance.json.
- **Replace the browser PAT flow**: the "trigger procedure" form currently
  stores a GitHub token in `localStorage`. Replace with a GitHub App or a
  small OAuth device-flow helper.

## Agentic direction

- **MCP server** (`push-to-comply-mcp`): expose tools like
  `list_gaps(standard)`, `get_control(id)`, `draft_policy(criteria)`,
  `trigger_procedure(id, fields)`, `procedure_history(id)` over the same
  code. Any MCP-capable agent (Claude, IDE agents, internal bots) can then
  operate the compliance program conversationally.
- **Agent-executed procedures**: extend procedure front-matter with an
  `automation` property (e.g. a prompt + allowed tools). The scheduler
  labels such tickets for an agent runner (GitHub Actions + Claude Code, or
  Claude GitHub app) which executes the checklist, attaches evidence, and
  leaves human sign-off as the closing act. Recurring evidence collection
  (access reviews, log reviews, backup verification) is the killer use case.
- **Drafting assistance**: seed prompts/workflows for "we adopted framework
  X; draft the missing policies mapped to the gap list" — the gap list in
  compliance.json is the natural input.
- **Auditor Q&A**: the rendered portal plus compliance.json make a clean RAG
  corpus; an auditor-facing agent can answer "show me the control and
  evidence for CC6.1" with links.

## Later

- Additional ticket adapters (Jira, Linear) via the existing adapter seam.
- Additional OSCAL artifacts: import profiles/baselines (Low/Moderate/High),
  export an OSCAL SSP or component-definition generated from the controls.
- Multi-framework cross-walks (one control satisfying TSC + 800-53 + CSF via
  published mapping tables, e.g. NIST CPRT exports).
- PDF export of the portal for auditors who want a binder.
