# Evidence Repository

An engagement-scoped evidence repository for a
[push-to-comply](https://github.com/push-to-comply/push-to-comply)
compliance program. One repository per engagement (e.g.
`evidence-2026-soc2`); start the next engagement with
`ptcomply init evidence-2027-soc2 --template <this template>`.

**This repository is sensitive.** Keep it private, apply your data
classification and retention policies to it, use Git LFS for binaries, and
grant access need-to-know. See the
[evidence architecture guide](https://github.com/push-to-comply/push-to-comply/blob/main/docs/evidence-architecture.md).

## Layout

| Directory       | Purpose                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `requests/`     | Auditor/assessment request list — one file per request, status in front-matter |
| `inbox/`        | Raw dumps: meeting transcripts, exports, emails — the triage source     |
| `evidence/<id>/`| Curated artifacts, keyed by request or control id                       |
| `observations/` | Gaps, findings, remediations — status/owner/due in front-matter         |
| `runbooks/`     | How/where to collect each evidence type in *your* environment           |

## Linking evidence to the program

Give every curated evidence file (or a sidecar `.md` next to a binary)
front-matter declaring what it supports — standards criteria and control
ids from your program repo:

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

Check coverage from your **program** repo:

```
ptcomply evidence coverage --dir ../evidence-2026-soc2
```

## Working with agents

The `.claude/skills/` directory ships workflows an agent can run here:
triage the inbox, draft evidence artifacts, log observations, and run the
engagement-close retrospective. Agents draft and organize; humans approve
and submit.
