---
name: engagement-retrospective
description: Close out an audit engagement - harvest lessons into runbooks, procedures, and the next engagement's template. Use when an audit or assessment wraps up, or when asked to prepare for next year's engagement.
---

Run the engagement-close retrospective. The goal: next year's engagement
starts smarter and collects most of its evidence automatically.

1. Inventory the engagement: read `requests/` (statuses), `evidence/`
   (what was produced), and `observations/` (what remains open).
2. For every request that was painful or manual, decide the fix:
   - Recurring evidence → draft a `cron` procedure for the **program
     repo** (with an `automation` block where an agent can collect it) and
     open it as a PR or hand the draft to the user.
   - Collection knowledge learned this year → write or update the runbook
     in `runbooks/`.
3. Open observations: confirm each has an owner and due date; anything
   structural should already be a program-repo PR — if not, draft it.
4. Propose updates to the org's evidence *template* repository (the one
   `ptcomply init` clones for next year): improved runbooks, request
   checklists, folder structure — so improvements outlive this repo.
5. Produce a closing summary: requests submitted/accepted, evidence
   produced, observations open vs resolved, procedures created from this
   engagement, and the checklist for opening next year's repo.
6. Archiving or deleting this repository is a human decision governed by
   the retention policy — recommend, don't do.
