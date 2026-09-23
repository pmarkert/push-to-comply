# Evidence

Curated artifacts, one subdirectory per request or control id. Every
markdown file — or a sidecar `.md` next to a binary (screenshot, PDF,
export) — carries front-matter linking it to the program:

    ---
    name: March access review export
    engagement: 2026-soc2
    date: 2026-03-02
    source: GitHub org member API
    collector: alice
    supports:
      TSC: [CC6.2]
      controls: [procedures/access_review]
    ---

Use Git LFS for binaries.
