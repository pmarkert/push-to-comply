---
name: draft-evidence
description: Collect or draft an evidence artifact for a specific request or control, following the org's runbooks. Use when asked to gather, build, export, or prepare evidence for an auditor request or criterion.
---

Produce a curated evidence artifact for the named request or control.

1. Read the request file in `requests/` (or the control in the program
   repo) to understand exactly what must be substantiated, including the
   audit period.
2. Check `runbooks/` for a matching collection runbook and follow it
   exactly. If none exists, propose the collection steps, confirm with the
   user, and after collecting, write the new runbook so next time is
   turnkey.
3. Place the artifact under `evidence/<request-or-control-id>/`. Binaries
   (screenshots, PDFs, exports) get a sidecar `.md`; text evidence is the
   `.md`. Front-matter always: `name`, `engagement`, `date`, `source`,
   `collector`, `supports` (criteria + `controls:`).
4. Evidence must be dated within the audit period and state where it came
   from. Never fabricate, backdate, or alter collected data — if something
   cannot be collected, say so and log an observation instead.
5. Update the request's `status` to `in-progress` and summarize what was
   produced and what a human still needs to do (review, screenshot,
   approve, submit). Submission to the auditor is a human action.
