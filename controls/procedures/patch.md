---
title: "Apply OS patches for {{this_month}}"
cron: "0 0 * * MON#1"
github:
  milestone: "{{this_month}}"
---

# OS Patch Procedure

Resolve this ticket by executing the following steps:

- [ ] Pull the latest scripts from the Ops repository
- [ ] Execute `ENV=staging patch-all.sh`
- [ ] Inspect output
  - [ ] Errors? Investigate and resolve
- [ ] Execute `ENV=production patch-all.sh`
- [ ] Attach log output to this ticket
