import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveTemplateUrl } from "../lib/init.mjs";

const BIN = fileURLToPath(new URL("../bin/ptcomply.mjs", import.meta.url));
const FIXTURES = fileURLToPath(new URL("./fixtures", import.meta.url));

const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "Test",
  GIT_AUTHOR_EMAIL: "test@example.com",
  GIT_COMMITTER_NAME: "Test",
  GIT_COMMITTER_EMAIL: "test@example.com",
};

function run(args, options = {}) {
  return execFileSync(process.execPath, [BIN, ...args], {
    encoding: "utf8",
    stdio: "pipe",
    env: GIT_ENV,
    ...options,
  });
}

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "ptcomply-init-"));
const templateRepo = path.join(workDir, "template-repo");

before(() => {
  // Build a local git template repository from the fixture content.
  fs.cpSync(FIXTURES, templateRepo, { recursive: true });
  for (const args of [
    ["init"],
    ["add", "-A"],
    ["commit", "-m", "template history"],
  ]) {
    execFileSync("git", args, { cwd: templateRepo, env: GIT_ENV, stdio: "pipe" });
  }
});

test("resolveTemplateUrl expands owner/repo shorthand, passes URLs and paths through", () => {
  assert.equal(
    resolveTemplateUrl("pmarkert/push-to-comply-template"),
    "https://github.com/pmarkert/push-to-comply-template.git"
  );
  assert.equal(
    resolveTemplateUrl("https://example.com/x.git"),
    "https://example.com/x.git"
  );
  assert.equal(resolveTemplateUrl("/tmp/some/path"), "/tmp/some/path");
});

test("init scaffolds a program from a template repository", () => {
  const target = path.join(workDir, "acme-compliance");
  run([
    "init",
    target,
    "--template",
    templateRepo,
    "--name",
    "Acme Corp.",
    "--short-name",
    "Acme",
  ]);

  assert.ok(fs.existsSync(path.join(target, "controls/policies/sample.md")));
  assert.ok(fs.existsSync(path.join(target, "standards/test-standard.md")));

  // organization context personalized
  const org = fs.readFileSync(
    path.join(target, "context/organization.yaml"),
    "utf8"
  );
  assert.match(org, /name: Acme Corp\./);
  assert.match(org, /short_name: Acme/);

  // fresh history: exactly one commit, not the template's
  const log = execFileSync("git", ["log", "--oneline"], {
    cwd: target,
    env: GIT_ENV,
    encoding: "utf8",
  });
  assert.equal(log.trim().split("\n").length, 1);
  assert.match(log, /Initialize compliance program/);

  // and the scaffolded program builds with the engine
  const outDir = path.join(workDir, "site");
  run(["build", "--quiet", "--out", outDir], { cwd: target });
  assert.ok(fs.existsSync(path.join(outDir, "compliance.json")));
});

test("init refuses a non-empty target directory", () => {
  assert.throws(
    () => run(["init", templateRepo, "--template", templateRepo]),
    (error) => error.status === 1 || /not empty/.test(String(error.stderr))
  );
});

test("init without --template uses the registry (non-interactive picks first)", () => {
  const registry = path.join(workDir, "registry.json");
  fs.writeFileSync(
    registry,
    JSON.stringify({
      version: 1,
      templates: [
        {
          name: "local-fixture",
          description: "Fixture template",
          repository: templateRepo,
          standards: ["TEST"],
        },
      ],
    })
  );
  const target = path.join(workDir, "from-registry");
  const output = run(["init", target, "--registry", registry, "--skip-git"]);
  assert.match(output, /local-fixture/);
  assert.ok(fs.existsSync(path.join(target, "context/organization.yaml")));
  assert.ok(!fs.existsSync(path.join(target, ".git")));
});

test("init --list prints the registry without cloning", () => {
  const registry = path.join(workDir, "registry.json");
  const output = run(["init", "--list", "--registry", registry]);
  assert.match(output, /local-fixture \[TEST\]/);
});
