import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The export script must produce clean, single-commit template repositories
// that carry everything a client program needs.

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "ptc-export-"));
const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "Test",
  GIT_AUTHOR_EMAIL: "test@example.com",
  GIT_COMMITTER_NAME: "Test",
  GIT_COMMITTER_EMAIL: "test@example.com",
};

execFileSync(
  process.execPath,
  ["scripts/export-repos.mjs", "--out", outDir],
  { env: GIT_ENV, stdio: "pipe" }
);
const soc2 = path.join(outDir, "soc2-template");
const evidence = path.join(outDir, "evidence-template");

test("soc2-template export contains the client-facing tree", () => {
  for (const file of [
    "controls/policies/access.md",
    "standards/tsc-2017.md",
    "context/organization.yaml",
    "assets/logo.svg",
    ".claude/skills/add-policy/SKILL.md",
    ".github/workflows/render_site.yaml",
    ".github/workflows/generate_tickets.yaml",
    ".github/workflows/agent_procedures.yaml",
    ".github/workflows/ci.yaml",
    "README.md",
    "AGENTS.md",
    "package.json",
  ]) {
    assert.ok(fs.existsSync(path.join(soc2, file)), `missing ${file}`);
  }
  // nothing engine- or monorepo-specific leaks into the template
  for (const absent of ["packages", "templates", "scripts", "plugins", ".claude-plugin", "templates.json", ".github/workflows/release.yaml"]) {
    assert.ok(!fs.existsSync(path.join(soc2, absent)), `unexpected ${absent}`);
  }
});

test("exported template depends on the registry engine and avoids npm ci", () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(soc2, "package.json"), "utf8")
  );
  const engineVersion = JSON.parse(
    fs.readFileSync("packages/push-to-comply/package.json", "utf8")
  ).version;
  assert.equal(pkg.dependencies["push-to-comply"], `^${engineVersion}`);

  for (const workflow of ["render_site.yaml", "generate_tickets.yaml"]) {
    const content = fs.readFileSync(
      path.join(soc2, ".github/workflows", workflow),
      "utf8"
    );
    assert.doesNotMatch(content, /npm ci/, `${workflow} still uses npm ci`);
  }
});

test("exports have a fresh single-commit history", () => {
  for (const repo of [soc2, evidence]) {
    const log = execFileSync("git", ["log", "--oneline"], {
      cwd: repo,
      env: GIT_ENV,
      encoding: "utf8",
    });
    assert.equal(log.trim().split("\n").length, 1, `${repo} history not clean`);
    assert.match(log, /Initial release/);
  }
});

test("evidence-template export carries its structure and skills", () => {
  for (const file of [
    "README.md",
    "AGENTS.md",
    "requests/example-request.md",
    "observations/example-observation.md",
    "runbooks/example-access-export.md",
    ".claude/skills/triage-inbox/SKILL.md",
    ".claude/skills/engagement-retrospective/SKILL.md",
  ]) {
    assert.ok(fs.existsSync(path.join(evidence, file)), `missing ${file}`);
  }
});
