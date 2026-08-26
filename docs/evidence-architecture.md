# Evidence Architecture

How to run audit engagements (SOC 2, ISO, customer assessments) alongside a
push-to-comply program — including with AI agents doing the heavy lifting.
push-to-comply deliberately does **not** implement assessment management or
auditor-portal integration; it provides the repository conventions, the
coverage crosswalk, and the agent skills so you (or your consultants) can
build that workflow on top.

## The two-repository topology

**Your compliance program repo** (built from a push-to-comply template) is
the program of record: policies, narratives, procedures, standards
mappings. It is long-lived, text-only, and readable by a broad internal
audience — possibly published as a trust portal.

**Evidence lives in separate, engagement-scoped repositories**, e.g.
`evidence-2026-soc2`. Never in the program repo, because:

- **Access control is repo-granular.** Evidence (meeting transcripts,
  emails, Slack exports, system configurations) is far more sensitive than
  policies. Separate repos let the portal stay open while evidence is
  need-to-know.
- **Retention requires forgetting; git only forgets by rewriting.** Your
  retention policy applies to evidence. An engagement-scoped repo can be
  archived or deleted whole when retention expires; evidence interleaved
  with policy history could only be purged by rewriting the very approval
  trail you exist to preserve.
- **Lifecycles differ.** The program is continuous; engagements are
  annual. Next year is a new repo (`ptcomply init evidence-2027-soc2
  --template <your-evidence-template>` — the template mechanism works for
  evidence repos too).
- **The program repo stays small and clonable forever.**

Security posture for evidence repos: private, no GitHub Pages, minimal or
no CI, Git LFS for binaries (screenshots, PDFs, recordings), and your
retention/classification policies explicitly applied.

## Evidence repository layout

```
evidence-2026-soc2/
  requests/          # auditor request list — one file per request, status in front-matter
  inbox/             # raw dumps: transcripts, exports, emails — triage source
  evidence/<id>/     # curated artifacts, keyed by request or control id
  observations/      # gaps, findings, remediations — status/owner/due in front-matter
  runbooks/          # org-specific instructions: how/where to collect each evidence type
  .claude/skills/    # agent workflows: triage-inbox, draft-evidence, log-observation, ...
  AGENTS.md          # repo guide for agents
```

## The linking vocabulary: `supports`

Evidence gains meaning by pointing at the program. Any markdown file in the
evidence repo may declare, in front-matter, what it supports — the same
shape as controls' `satisfies`, plus the reserved key `controls`:

```yaml
---
name: March access review export
engagement: 2026-soc2
date: 2026-03-02
source: GitHub org member API
collector: alice
supports:
  TSC: [CC6.2, CC6.3]
  controls: [procedures/access_review]
---
```

Binary artifacts get a sidecar markdown file carrying the front-matter and
a relative link to the file.

## The crosswalk

From the **program** repo:

```
ptcomply evidence coverage --dir ../evidence-2026-soc2 [--engagement 2026-soc2] [--json] [--fail-on-missing]
```

reports, per standard, which criteria have evidence and which have none —
the triage view for "what should we work on next" — and flags evidence
whose `supports` references unknown standards, criteria, or controls.

## Observations, and the flywheel

Observations (`observations/`) record gaps, findings, and remediations
discovered during the engagement, with `status`, `owner`, `due`, and
`related` (control ids) in front-matter. They are the bridge back to the
program: a finding graduates into the program repo as a pull request — a
corrected policy or, better, a **new `cron` procedure**.

That last move is the flywheel: the goal of each engagement is to convert
one-off evidence hunts into scheduled procedures. Then the ticket scheduler
generates dated, assigned, closed-with-artifacts evidence all year, and the
next audit is mostly retrieval. Close every engagement with a
retrospective: which requests were painful? Promote them to procedures.
Which runbooks were wrong? Fix them in the evidence template so next year's
repo starts smarter.

## Where agents fit

The evidence template ships skills for the recurring agent workflows:
triaging raw dumps in `inbox/` against open requests and criteria, drafting
evidence artifacts per the runbooks, logging observations, and running the
engagement retrospective. An organization's own integrations — for example
a local MCP server that reads and posts to their auditor's portal — plug in
beside these conventions: the skills use portal tools when present and
degrade to "prepare it for a human to submit" when not.

Agents draft and organize; humans approve and submit. As with procedure
tickets, sign-off actions (closing a request, submitting to an auditor)
belong to people unless you have explicitly decided otherwise.
