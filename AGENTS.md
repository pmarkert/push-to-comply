# Agent Guide for push-to-comply

This repository manages a compliance program as git artifacts. Policies,
narratives, and procedures live as markdown documents that map to compliance
framework criteria; the build renders a documentation portal and a
machine-readable compliance snapshot, and a scheduler generates tickets for
recurring procedures.

## Repository layout

This is an npm-workspaces monorepo: the **engine** (published to npm as
`push-to-comply`, CLI name `ptcomply`) lives under `packages/`, and the
repository root is the **content template** that organizations clone.

| Path                                    | Purpose                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| `controls/policies/`                    | Policy documents (markdown + YAML front-matter)                                |
| `controls/narratives/`                  | Narrative documents describing the organization and environment                |
| `controls/procedures/`                  | Recurring/on-demand procedure templates that become tickets                    |
| `standards/`                            | Framework definitions: markdown/YAML (opencontrol-style) or OSCAL JSON catalogs |
| `context/`                              | Static YAML context merged into all Handlebars templates                       |
| `assets/`                               | This organization's branding assets (overlaid on engine defaults)              |
| `packages/push-to-comply/lib/`          | Engine modules: `site.mjs`, `content.mjs`, `tickets.mjs`, `templates.mjs`, `oscal.mjs` |
| `packages/push-to-comply/bin/`          | The `ptcomply` CLI                                                             |
| `packages/push-to-comply/defaults/`     | Default layouts and CSS/JS assets (a content repo overrides by filename)       |
| `packages/push-to-comply/test/`         | Engine tests, self-contained against `test/fixtures/`                          |
| `test/`                                 | Template integration tests (build the real content via the CLI)                |

## Commands

- `npm test` — run engine tests then template integration tests (Node 22+).
- `ptcomply init <dir> [--template <repo>]` — scaffold a new compliance
  program from a template repository (registry: `templates.json` at repo
  root).
- `npm run build` / `ptcomply build` — render the site into `public/`,
  including `public/compliance.json`.
- `ptcomply gaps [--standard KEY] [--json] [--fail-on-gaps]` — report
  unsatisfied criteria.
- `npm run serve` / `npm run watch` — local preview.
- `ptcomply procedures --dry-run` — evaluate the ticket scheduler without
  creating issues (works offline; GitHub reads are skipped or tolerated).

Engine changes go in `packages/push-to-comply` (with tests against the
fixtures); compliance content changes go in the repository root. Don't add
content-specific behavior to the engine.

## Working on compliance content (the common case)

- Every control document is markdown with optional YAML front-matter. The
  `satisfies` property maps the document to framework criteria:

  ```yaml
  satisfies:
    TSC:
      - CC6.1
  ```

  The mapping key (`TSC`) must equal the standard's `name` (for markdown/YAML
  standards) or the OSCAL catalog's filename without extension.

- Handlebars runs in **strict mode** over both front-matter and body. Any
  `{{macro}}` must resolve from `context/*.yaml`, date context, or the
  procedure's declared `dynamic_fields` — an unknown macro fails the build.
- Procedures with a `cron` property generate tickets automatically; declare
  every runtime placeholder in `dynamic_fields`.
- After editing content, run `npm run build` to validate: it catches unknown
  macros, broken relative links, and malformed front-matter.

## Machine-readable outputs

`npm run build` writes `public/compliance.json`: every standard with
per-criterion coverage (`satisfied`, contributing control ids, and an
`unsatisfied` gap list) plus an index of all controls with their metadata.
Use it to answer questions like "which TSC criteria have no mapped control?"
without parsing HTML.

## Conventions

- Plain ESM JavaScript (`.mjs`), no build step, no TypeScript.
- Keep runtime dependencies minimal; tests use `node:test` only.
- Do not commit framework text with restrictive licenses (e.g. verbatim AICPA
  TSC wording or ISO 27001). NIST publications (800-53, CSF) are public domain
  and safe to include as OSCAL JSON.
- Changes to policies/procedures are reviewed via pull request — that PR
  history is the approval evidence trail, so keep commits scoped and messages
  descriptive.
