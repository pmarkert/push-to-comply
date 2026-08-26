# Agent Guide — Evidence Repository

This is an engagement-scoped evidence repository for a push-to-comply
compliance program. Everything here is sensitive: never copy its contents
to external services, and never weaken its front-matter records.

## Layout and conventions

- `requests/` — one markdown file per auditor/assessment request.
  Front-matter: `id`, `title`, `status` (open | in-progress | submitted |
  accepted), `due`, `supports` (criteria this request maps to).
- `inbox/` — raw, untriaged material (transcripts, exports, emails). Your
  job is usually to move meaning *out* of here, not to edit these files.
- `evidence/<request-or-control-id>/` — curated artifacts. Every markdown
  file (or sidecar `.md` beside a binary) carries front-matter:
  `name`, `engagement`, `date`, `source`, `collector`, and `supports`
  (standard keys → criterion ids, plus `controls:` → control ids from the
  program repo).
- `observations/` — findings and remediations. Front-matter: `status`
  (open | in-progress | resolved), `severity`, `owner`, `due`, `related`
  (control ids). Observations should graduate into the program repo as
  pull requests — a fixed policy or a new scheduled procedure.
- `runbooks/` — org-specific collection instructions. Follow them exactly;
  when one is wrong or missing, fix or add it as part of your work.

## Rules

1. **Humans approve and submit.** Draft, organize, and recommend; do not
   submit to auditors or mark requests accepted unless a human directs it.
2. Coverage questions are answered from the program repo:
   `ptcomply evidence coverage --dir <this repo>`.
3. Prefer converting recurring evidence needs into `cron` procedures in
   the program repo — that is the point of the whole system.
4. Use the skills in `.claude/skills/` for the standard workflows.
