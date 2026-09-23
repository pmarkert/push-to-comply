---
name: Export GitHub organization members
produces: evidence for access review requests
---

1. Authenticate as a user with org read access (`gh auth status`).
2. `gh api orgs/OUR-ORG/members --paginate --jq '.[].login' > members.txt`
3. Save the output under `evidence/<request-id>/` with a sidecar `.md`
   carrying the standard front-matter (`supports`, `date`, `source`,
   `collector`).
