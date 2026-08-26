# push-to-comply (engine)

GRC meets DevOps — the engine behind
[push-to-comply](https://github.com/pmarkert/push-to-comply): manage a
compliance program as git artifacts. Policies, narratives, and procedures are
markdown documents mapped to compliance framework criteria (SOC 2 TSC,
NIST 800-53 via OSCAL, or your own); this package renders the documentation
portal, computes coverage and gaps, and schedules recurring procedure
tickets.

This package is the tooling only. Your compliance content lives in your own
repository (start from the
[template](https://github.com/pmarkert/push-to-comply)); run the `ptcomply`
CLI from its root:

```
ptcomply build         # render the portal into public/, incl. compliance.json
ptcomply gaps          # report unsatisfied criteria (--json, --standard KEY, --fail-on-gaps)
ptcomply procedures    # evaluate schedules and generate tickets (--dry-run to preview)
```

Default layouts and assets are bundled; override any of them by creating a
file of the same name under `layouts/` or `assets/` in your content
repository. See the template repository's README for the full content
format documentation.

Requires Node.js 22+.
