# Agent Guide for this Compliance Program

This repository is a push-to-comply compliance program: markdown control
documents (policies, narratives, procedures) with YAML front-matter,
mapped to framework criteria and rendered into a documentation portal.
Pull-request history is the approval evidence trail — keep commits scoped
and messages descriptive.

## Conventions

- Every control document may declare `satisfies`, mapping standard keys to
  criterion ids:

  ```yaml
  satisfies:
    TSC:
      - CC6.1
  ```

- Handlebars runs in **strict mode** over front-matter and body: every
  `{{macro}}` must resolve from `context/*.yaml`, date context, or a
  procedure's declared `dynamic_fields`. Use context macros instead of
  hardcoding organization facts.
- Procedures with `cron` generate scheduled tickets; `automation` blocks
  let an agent execute or assist (the agent never closes a ticket — a
  human closes it as sign-off).
- Documents must describe what the organization *actually does* — never
  aspirational boilerplate. Auditors test what is written.

## Commands (from the repo root)

- `npx ptcomply validate` — mapping and front-matter integrity (run after
  every content change)
- `npx ptcomply build` — render the portal; catches unknown macros and
  broken links; writes `public/compliance.json`
- `npx ptcomply gaps [--standard KEY]` — unsatisfied criteria
- `npx ptcomply procedures --dry-run` — preview the ticket scheduler
- `npx ptcomply evidence coverage --dir <evidence-repo>` — evidence
  crosswalk (audits live in separate evidence repositories)

## Skills

Use the workflows in `.claude/skills/`: `add-policy`, `map-controls`,
`run-procedure`. Full engine documentation:
https://github.com/push-to-comply/push-to-comply
