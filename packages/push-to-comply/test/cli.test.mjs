import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// End-to-end tests of the ptcomply CLI against the fixture content repo in
// test/fixtures — no dependence on any real compliance content.

const BIN = fileURLToPath(new URL("../bin/ptcomply.mjs", import.meta.url));
const FIXTURES = fileURLToPath(new URL("./fixtures", import.meta.url));

function run(args, options = {}) {
  return execFileSync(process.execPath, [BIN, ...args], {
    cwd: FIXTURES,
    encoding: "utf8",
    stdio: "pipe",
    ...options,
  });
}

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "ptcomply-cli-"));

test("build renders the fixture site with the engine's default layouts", () => {
  run(["build", "--quiet", "--out", outDir]);
  for (const page of [
    "index.html",
    "policies/sample.html",
    "narratives/overview.html",
    "procedures/check.html",
    "standards/test-standard.html",
    "standards/TEST.html", // alias under the mapping key
    "assets/css/styles.css", // engine default asset
    "assets/logo.svg", // content-repo asset overlay
    "compliance.json",
  ]) {
    assert.ok(fs.existsSync(path.join(outDir, page)), `missing ${page}`);
  }
});

test("compliance.json reports fixture coverage and gaps", () => {
  const summary = JSON.parse(
    fs.readFileSync(path.join(outDir, "compliance.json"), "utf8")
  );
  const standard = summary.standards.find((s) => s.key === "TEST");
  assert.deepEqual(standard.stats, { total: 2, satisfied: 1 });
  assert.deepEqual(standard.unsatisfied, ["C-2"]);
  const policy = summary.controls.find((c) => c.id === "policies/sample");
  assert.deepEqual(policy.satisfies, { TEST: ["C-1"] });
});

test("gaps prints unsatisfied criteria", () => {
  const output = run(["gaps"]);
  assert.match(output, /TEST — Test Standard: 1\/2 satisfied \(50%\)/);
  assert.match(output, /GAP C-2\s+Second Criterion \(F1\)/);
  assert.doesNotMatch(output, /GAP C-1\b/);
});

test("gaps --json emits the machine-readable summary", () => {
  const summary = JSON.parse(run(["gaps", "--json", "--standard", "TEST"]));
  assert.equal(summary.standards.length, 1);
  assert.deepEqual(summary.standards[0].unsatisfied, ["C-2"]);
});

test("gaps --fail-on-gaps exits non-zero when gaps exist", () => {
  assert.throws(
    () => run(["gaps", "--fail-on-gaps"]),
    (error) => error.status === 1
  );
});

test("gaps rejects an unknown standard key", () => {
  assert.throws(
    () => run(["gaps", "--standard", "NOPE"]),
    (error) => error.status === 1 && /Unknown standard/.test(error.stderr)
  );
});

test("procedures --dry-run works offline against fixtures", () => {
  run(["procedures", "--dry-run"], {
    env: { ...process.env, GITHUB_OWNER: "example", GITHUB_REPO: "example" },
  });
});

test("unknown commands fail with usage", () => {
  assert.throws(
    () => run(["bogus"]),
    (error) => error.status === 1 && /Unknown command/.test(error.stderr)
  );
});

test("version prints the package version", () => {
  const pkg = JSON.parse(
    fs.readFileSync(
      fileURLToPath(new URL("../package.json", import.meta.url)),
      "utf8"
    )
  );
  assert.equal(run(["version"]).trim(), pkg.version);
});
