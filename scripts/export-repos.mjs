#!/usr/bin/env node
// Exports the publishable repositories from this monorepo, each as a clean
// tree with a fresh single-commit git history, ready to push to the
// push-to-comply GitHub organization:
//
//   node scripts/export-repos.mjs [--out dist/repos] [--version <engine version>]
//
//   dist/repos/soc2-template      -> github.com/push-to-comply/soc2-template
//   dist/repos/evidence-template  -> github.com/push-to-comply/evidence-template
//
// See RELEASING.md for the full release playbook.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ASSETS = path.join(ROOT, "scripts", "assets");

const { values } = parseArgs({
  options: {
    out: { type: "string", default: path.join("dist", "repos") },
    version: { type: "string" },
  },
});

const engineVersion =
  values.version ??
  JSON.parse(
    fs.readFileSync(
      path.join(ROOT, "packages/push-to-comply/package.json"),
      "utf8"
    )
  ).version;

const monorepoCommit = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
  cwd: ROOT,
  encoding: "utf8",
}).trim();

const outRoot = path.resolve(ROOT, values.out);

function copy(source, target) {
  fs.cpSync(path.join(ROOT, source), path.join(target, source), {
    recursive: true,
  });
}

function freshRepo(directory, message) {
  for (const args of [
    ["init", "-q", "-b", "main"],
    ["add", "-A"],
    ["commit", "-q", "-m", message],
  ]) {
    execFileSync("git", args, { cwd: directory, stdio: "pipe" });
  }
}

function exportSoc2Template() {
  const target = path.join(outRoot, "soc2-template");
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });

  for (const source of [
    "controls",
    "standards",
    "context",
    "assets",
    ".claude",
    ".gitignore",
    ".nvmrc",
    ".nojekyll",
    "CLAUDE.md",
  ]) {
    copy(source, target);
  }

  // Workflows: the content-facing ones only; exported repos have no
  // lockfile until their first commit, so npm ci becomes npm install.
  const workflowDir = path.join(target, ".github", "workflows");
  fs.mkdirSync(workflowDir, { recursive: true });
  for (const workflow of [
    "render_site.yaml",
    "generate_tickets.yaml",
    "agent_procedures.yaml",
  ]) {
    const content = fs.readFileSync(
      path.join(ROOT, ".github", "workflows", workflow),
      "utf8"
    );
    fs.writeFileSync(
      path.join(workflowDir, workflow),
      content.replaceAll("npm ci", "npm install")
    );
  }
  fs.copyFileSync(
    path.join(ASSETS, "soc2-template", "ci.yaml"),
    path.join(workflowDir, "ci.yaml")
  );

  for (const file of ["README.md", "AGENTS.md"]) {
    fs.copyFileSync(
      path.join(ASSETS, "soc2-template", file),
      path.join(target, file)
    );
  }

  fs.writeFileSync(
    path.join(target, "package.json"),
    JSON.stringify(
      {
        name: "compliance-program",
        private: true,
        version: "1.0.0",
        type: "module",
        dependencies: { "push-to-comply": `^${engineVersion}` },
        scripts: {
          build: "ptcomply build",
          clean: "rm -rf public",
          gaps: "ptcomply gaps",
          validate: "ptcomply validate",
          procedures: "ptcomply procedures",
          serve: "npx live-server -q public",
        },
      },
      null,
      2
    ) + "\n"
  );

  freshRepo(
    target,
    `Initial release (from push-to-comply ${engineVersion}, ${monorepoCommit})`
  );
  return target;
}

function exportEvidenceTemplate() {
  const target = path.join(outRoot, "evidence-template");
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(path.join(ROOT, "templates", "evidence"), target, {
    recursive: true,
  });
  freshRepo(
    target,
    `Initial release (from push-to-comply ${engineVersion}, ${monorepoCommit})`
  );
  return target;
}

const soc2 = exportSoc2Template();
const evidence = exportEvidenceTemplate();

console.log(`Exported (engine version ${engineVersion}, source ${monorepoCommit}):`);
console.log(`  ${soc2}`);
console.log(`  ${evidence}`);
console.log(`
To publish (after creating the empty org repositories):
  cd ${path.relative(process.cwd(), soc2)} && git remote add origin git@github.com:push-to-comply/soc2-template.git && git push -u origin main
  cd ${path.relative(process.cwd(), evidence)} && git remote add origin git@github.com:push-to-comply/evidence-template.git && git push -u origin main
`);
