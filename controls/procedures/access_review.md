---
name: Monthly Access Review
cron: "0 0 1 * *"
satisfies:
  TSC:
    - CC6.2
    - CC6.3
github:
  milestone: "{{this_month}}"
  labels: ["access-review"]
automation:
  mode: assist
  instructions: |
    Compile the current access lists for review:

    1. Export the member list of our GitHub organization (`gh api orgs/{org}/members`).
    2. Export the list of users with access to production cloud accounts.
    3. Compare both lists against the current employee roster.
    4. Post a comment on this ticket containing a table of each account,
       its owner, and whether the owner appears on the roster, flagging
       any account whose owner is not on the roster or whose access looks
       broader than their role requires.
  evidence:
    - Comment with the account comparison table and flagged discrepancies
    - Links or attachments for the raw exports used
---

Resolve this ticket by executing the following steps:

- [ ] Review the agent-compiled account comparison (or compile it manually if no agent ran)
- [ ] For each flagged account: confirm removal or document the justification on this ticket
- [ ] Verify removals were completed in the source systems
- [ ] Close this ticket to sign off the review for {{this_month}}
