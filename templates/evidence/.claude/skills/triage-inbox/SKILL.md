---
name: triage-inbox
description: Triage raw material in the evidence repo's inbox/ against open requests and criteria. Use when new transcripts, exports, or dumps land in inbox/, or when asked what the inbox contains or what to work on next.
---

Triage `inbox/` for this engagement.

1. List `inbox/` and read each untriaged item. Read every file in
   `requests/` to know the open requests and the criteria they support.
2. For each inbox item, decide what it substantiates: which request(s),
   criteria, or program controls. An item can support several; many
   support none (note that too).
3. For each match, create or update a curated entry under
   `evidence/<request-or-control-id>/`: a markdown file that summarizes
   the relevant content, links to the inbox source file (relative path),
   and carries complete front-matter — `name`, `engagement`, `date`,
   `source`, `collector` (ask if unknown), and `supports` with the
   standard keys/criterion ids and `controls:` ids.
4. Do not modify or delete inbox files. Do not change request `status`
   beyond `open → in-progress`; `submitted`/`accepted` are human actions.
5. Finish with a summary: items triaged, evidence entries created, inbox
   items that matched nothing, and — if the program repo is available —
   run `ptcomply evidence coverage --dir .` from it and report which open
   requests now look ready to submit.
