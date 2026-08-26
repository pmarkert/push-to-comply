import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// End-to-end smoke test: build the template's real content with the ptcomply
// CLI into a temp directory and verify the key pages and the machine-readable
// compliance snapshot.

const BIN = path.resolve("node_modules/.bin/ptcomply");
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "ptc-site-"));

test("site build succeeds and produces expected artifacts", () => {
  execFileSync(BIN, ["build", "--quiet", "--out", outDir], { stdio: "pipe" });

  for (const page of [
    "index.html",
    "policies/index.html",
    "procedures/index.html",
    "narratives/index.html",
    "policies/access.html",
    "standards/tsc-2017.html",
    // alias published under the standard's mapping key, used by control pages
    "standards/TSC.html",
    // default assets come from the engine; branding assets from this repo
    "assets/css/styles.css",
    "assets/logo.svg",
  ]) {
    assert.ok(fs.existsSync(path.join(outDir, page)), `missing ${page}`);
  }
});

test("compliance.json reports coverage for each standard", () => {
  const summary = JSON.parse(
    fs.readFileSync(path.join(outDir, "compliance.json"), "utf8")
  );
  assert.ok(summary.generated_at);
  const tsc = summary.standards.find((s) => s.key === "TSC");
  assert.ok(tsc, "TSC standard missing from compliance.json");
  assert.ok(tsc.stats.total > 0);
  assert.ok(tsc.stats.satisfied > 0);
  assert.ok(Array.isArray(tsc.unsatisfied));

  const access = summary.controls.find((c) => c.id === "policies/access");
  assert.ok(access);
  assert.deepEqual(access.satisfies.TSC.slice(0, 2), ["CC6.1", "CC6.2"]);

  const criteria = Object.values(tsc.families).flatMap((f) => f.criteria);
  const cc61 = criteria.find((c) => c.id === "CC6.1");
  assert.ok(cc61.satisfied);
  assert.ok(cc61.controls.includes("policies/access"));
});
