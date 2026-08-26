---
name: log-observation
description: Record a gap, finding, or remediation item discovered during evidence work. Use whenever evidence collection reveals something missing, broken, or aspirational-but-not-practiced, or when asked to track a follow-up.
---

Record an observation in `observations/`.

1. One markdown file per observation, named for its subject. Front-matter:
   `title`, `status: open`, `severity` (low | medium | high), `owner` (ask
   if unclear), `due` (propose a date), `related` with `controls:` ids
   and/or criteria.
2. The body states: what was found, the evidence trail that revealed it
   (link the files), why it matters for which criteria, and a concrete
   recommended remediation.
3. When the remediation is recurring in nature ("we should check X every
   month"), recommend it as a new `cron` procedure in the program repo —
   include a ready-to-use draft of the procedure markdown in the
   observation body. Converting evidence hunts into scheduled procedures
   is the system's core flywheel.
4. Never mark an observation `resolved` yourself; that's the owner's call
   after remediation is verified.
5. If asked for status, summarize `observations/` grouped by status and
   severity, flagging anything past `due`.
