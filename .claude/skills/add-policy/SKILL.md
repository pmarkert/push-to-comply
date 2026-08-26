---
name: add-policy
description: Add or revise a policy, narrative, or procedure in this compliance program, correctly mapped to framework criteria. Use when asked to write, add, update, or fix a control document.
---

Author or revise a control document in this program repo.

1. **Location and shape.** Policies → `controls/policies/`, narratives →
   `controls/narratives/`, procedures → `controls/procedures/`. Markdown
   with YAML front-matter: `name`, optional `owner`/`version`/
   `approval_date`, and `satisfies` mapping standard keys to criterion
   ids. Procedures may add `cron`, `dynamic_fields`, `github`
   (labels/assignees/milestone), and `automation` (see README).
2. **Write what the org actually does — never aspirational boilerplate.**
   Auditors test what is written. If actual practice is unknown, ask the
   user concrete questions before writing (e.g. "how often do you
   *actually* review access?"). Prefer accurate-but-modest over
   impressive-but-false.
3. **Macros.** Handlebars runs in strict mode over front-matter and body.
   Use `{{organization.name}}`-style values from `context/*.yaml` instead
   of hardcoding org facts; any macro must resolve from context, date
   context, or declared `dynamic_fields`.
4. **Map it.** Look up the right criteria in `standards/` (or
   `public/compliance.json` after a build). Map only criteria the document
   genuinely helps satisfy.
5. **Verify before finishing**, from the repo root:
   - `npx ptcomply validate` — mappings and front-matter integrity
   - `npx ptcomply build` — catches unknown macros and broken links
   - `npx ptcomply gaps` — confirm intended criteria flipped to satisfied
6. Changes ship as a pull request — the PR review is the approval
   evidence. Keep the commit scoped and descriptive.
