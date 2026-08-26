#!/usr/bin/env node
// ptcomply — the push-to-comply engine CLI.
// Runs from the root of a compliance content repository.

import { parseArgs } from "node:util";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const USAGE = `ptcomply ${version} — compliance programs as git artifacts

Usage: ptcomply <command> [options]

Commands:
  init <dir>   Start a new compliance program from a template repository
                 --template <repo>  git URL, owner/repo shorthand, or local path
                                    (omit to choose from the published registry)
                 --list             list registry templates and exit
                 --registry <url>   alternate registry (default: templates.json
                                    on pmarkert/push-to-comply main)
                 --name <name>      organization name for context/organization.yaml
                 --short-name <n>   organization short name
                 --skip-git         do not create a fresh git repository
  build        Render the documentation portal and compliance.json
                 --out <dir>       output directory (default: public)
                 --quiet           suppress per-page logging
  procedures   Evaluate procedure schedules and generate tickets
                 [payload]         JSON client payload for a manual trigger
                 --dry-run         report what would happen without creating issues
  gaps         Report unsatisfied criteria per standard
                 --standard <key>  only this standard (mapping key)
                 --json            print the machine-readable summary
                 --fail-on-gaps    exit non-zero if any criterion is unsatisfied
  version      Print the engine version

Environment overrides: CONTROLS_DIRECTORY, STANDARDS_DIRECTORY,
CONTEXT_DIRECTORY, LAYOUTS_DIRECTORY, ASSETS_DIRECTORY, OUTPUT_DIRECTORY,
GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, START_OF_COMPLIANCE,
TICKET_SAFETY_LIMIT, DRY_RUN, QUIET.
`;

const [command, ...rest] = process.argv.slice(2);

function printTemplates(templates) {
  templates.forEach((t, i) =>
    console.log(
      `  ${i + 1}. ${t.name} [${(t.standards ?? []).join(", ")}] — ${t.description}\n     ${t.repository}`
    )
  );
}

async function chooseTemplate(templates) {
  console.log("Available templates:");
  printTemplates(templates);
  if (!process.stdin.isTTY || templates.length === 1) {
    console.log(`Using template: ${templates[0].name}`);
    return templates[0];
  }
  const readline = await import("node:readline/promises");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(
    `Choose a template [1-${templates.length}] (1): `
  );
  rl.close();
  const index = parseInt(answer || "1", 10) - 1;
  if (!(index >= 0 && index < templates.length)) {
    throw new Error(`Invalid selection: ${answer}`);
  }
  return templates[index];
}

switch (command) {
  case "init": {
    const { values, positionals } = parseArgs({
      args: rest,
      allowPositionals: true,
      options: {
        template: { type: "string" },
        list: { type: "boolean" },
        registry: { type: "string" },
        name: { type: "string" },
        "short-name": { type: "string" },
        "skip-git": { type: "boolean" },
      },
    });
    const { fetchTemplateRegistry, initProgram } = await import(
      "../lib/init.mjs"
    );
    if (values.list) {
      const registry = await fetchTemplateRegistry(values.registry);
      printTemplates(registry.templates ?? []);
      break;
    }
    const directory = positionals[0];
    if (!directory) {
      console.error("Usage: ptcomply init <directory> [--template <repo>]");
      process.exitCode = 1;
      break;
    }
    let template = values.template;
    if (!template) {
      const registry = await fetchTemplateRegistry(values.registry);
      const templates = registry.templates ?? [];
      if (!templates.length) {
        throw new Error("The template registry lists no templates.");
      }
      template = (await chooseTemplate(templates)).repository;
    }
    await initProgram({
      directory,
      template,
      name: values.name,
      short_name: values["short-name"],
      skipGit: values["skip-git"],
    });
    break;
  }

  case "build": {
    const { values } = parseArgs({
      args: rest,
      options: {
        out: { type: "string" },
        quiet: { type: "boolean" },
      },
    });
    if (values.out) process.env.OUTPUT_DIRECTORY = values.out;
    if (values.quiet) process.env.QUIET = "1";
    const { buildSite } = await import("../lib/site.mjs");
    buildSite();
    break;
  }

  case "procedures": {
    const { values, positionals } = parseArgs({
      args: rest,
      allowPositionals: true,
      options: { "dry-run": { type: "boolean" } },
    });
    if (values["dry-run"]) process.env.DRY_RUN = "1";
    const payloadJson = positionals[0];
    const clientPayload =
      payloadJson && payloadJson !== "null" ? JSON.parse(payloadJson) : {};
    const { runProcedures } = await import("../lib/tickets.mjs");
    const failures = await runProcedures(clientPayload);
    if (failures.length) {
      console.error(`${failures.length} procedure(s) failed:`, failures);
      process.exitCode = 1;
    }
    break;
  }

  case "gaps": {
    const { values } = parseArgs({
      args: rest,
      options: {
        standard: { type: "string" },
        json: { type: "boolean" },
        "fail-on-gaps": { type: "boolean" },
      },
    });
    const { default: templates } = await import("../lib/templates.mjs");
    const { loadControls, loadStandards, complianceSummary } = await import(
      "../lib/content.mjs"
    );
    const context = templates.mergeContext();
    const { controls } = loadControls(context);
    const standards = loadStandards(context, controls);
    const summary = complianceSummary(context, standards, controls);
    const selected = summary.standards.filter(
      (s) => !values.standard || s.key === values.standard
    );
    if (values.standard && !selected.length) {
      console.error(`Unknown standard: ${values.standard}`);
      console.error(
        `Available: ${summary.standards.map((s) => s.key).join(", ")}`
      );
      process.exitCode = 1;
      break;
    }
    if (values.json) {
      console.log(JSON.stringify({ ...summary, standards: selected }, null, 2));
    } else {
      for (const standard of selected) {
        const pct = Math.round(
          (standard.stats.satisfied / (standard.stats.total || 1)) * 100
        );
        console.log(
          `${standard.key} — ${standard.name}: ${standard.stats.satisfied}/${standard.stats.total} satisfied (${pct}%)`
        );
        for (const [familyName, family] of Object.entries(standard.families)) {
          for (const criterion of family.criteria) {
            if (!criterion.satisfied) {
              console.log(
                `  GAP ${criterion.id}  ${criterion.name ?? ""} (${familyName})`
              );
            }
          }
        }
      }
    }
    const gapCount = selected.reduce((n, s) => n + s.unsatisfied.length, 0);
    if (values["fail-on-gaps"] && gapCount > 0) {
      console.error(`${gapCount} unsatisfied criteria.`);
      process.exitCode = 1;
    }
    break;
  }

  case "version":
  case "--version":
  case "-v":
    console.log(version);
    break;

  case "help":
  case "--help":
  case "-h":
  case undefined:
    console.log(USAGE);
    if (command === undefined) process.exitCode = 1;
    break;

  default:
    console.error(`Unknown command: ${command}\n`);
    console.log(USAGE);
    process.exitCode = 1;
}
