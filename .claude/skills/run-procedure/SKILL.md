---
name: run-procedure
description: Execute or assist with a procedure ticket from this compliance program - working the checklist, gathering evidence, and posting results. Use when asked to run, execute, or help with a procedure or its generated issue.
---

Execute (or assist with) a procedure ticket.

1. **Find the work.** Tickets are GitHub issues labeled `push-to-comply`
   plus the procedure id. Read the ticket body fully — including the
   "Agent Instructions" section if present, and respect its declared mode:
   `assist` = gather information and draft evidence only; `execute` =
   perform the listed actions.
2. **Do the checklist items you can do**, in order. For steps requiring
   credentials, systems, or judgment you don't have, do the preparation
   and clearly hand off the rest.
3. **Evidence onto the ticket.** Post results as comments: outputs,
   tables, links to exports. Evidence must be real, dated, and traceable
   to its source — never fabricated or approximated. If the org keeps an
   evidence repository, also file curated artifacts there with `supports`
   front-matter.
4. **Never close the ticket.** A human assignee reviews the evidence and
   closes it — closure is the sign-off the audit trail depends on. Also
   never check off checklist items you did not perform.
5. **Triggering:** on-demand procedures can be started with
   `npx ptcomply procedures '{"procedure":"<id>", ...dynamic_fields}'`
   (needs GITHUB_TOKEN/OWNER/REPO) or the portal's trigger form. Preview
   any scheduling question with `npx ptcomply procedures --dry-run`.
6. If the procedure itself was wrong or painful (missing steps, stale
   links), propose the fix to `controls/procedures/<id>.md` as a PR.
