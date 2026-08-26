# Compliance Program

A [push-to-comply](https://github.com/push-to-comply/push-to-comply)
compliance program: policies, narratives, and recurring procedures tracked
as git artifacts and mapped to framework criteria (SOC 2 Trust Services
Criteria out of the box). Reviews happen as pull requests — that history is
your approval evidence. A documentation portal, gap analysis, and a ticket
scheduler for recurring procedures come with it.

## Quick start

```
npm install
npx ptcomply build      # render the portal into public/ (+ compliance.json)
npx ptcomply gaps       # which criteria have no mapped control?
npx ptcomply validate   # check mappings and front-matter integrity
```

Or skip local tooling entirely: edit the markdown in the GitHub UI and
merge PRs — the bundled workflows build the portal and run the ticket
scheduler in Actions.

## Make it yours

1. Set your organization's facts in `context/*.yaml` (name, contacts,
   branding — they flow into every document via `{{macros}}`).
2. Rewrite the narratives in `controls/narratives/` for *your*
   environment.
3. Edit the policies in `controls/policies/` to describe what you
   **actually do** — auditors test what is written.
4. Adjust `controls/procedures/` schedules and assignees; delete what you
   won't run.
5. Replace `assets/logo.svg` / `assets/favicon.ico`.

Working with Claude? The skills in `.claude/skills/` know these
conventions, and the guided setup interview is available via
`/plugin marketplace add push-to-comply/push-to-comply`.

## Full documentation

Formats, standards (including OSCAL catalogs), scheduling, agent-executed
procedures, evidence architecture, and customization:
https://github.com/push-to-comply/push-to-comply
