import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/ptcomply.mjs", import.meta.url));
const FIXTURES = fileURLToPath(new URL("./fixtures", import.meta.url));

const evidenceDir = fs.mkdtempSync(path.join(os.tmpdir(), "ptc-evidence-"));

before(() => {
  fs.mkdirSync(path.join(evidenceDir, "evidence/c-1"), { recursive: true });
  fs.writeFileSync(
    path.join(evidenceDir, "evidence/c-1/export.md"),
    [
      "---",
      "name: Account export",
      "engagement: 2026-test",
      "date: 2026-03-01",
      "supports:",
      "  TEST: [C-1]",
      "  controls: [policies/sample]",
      "---",
      "",
      "Export notes.",
    ].join("\n")
  );
  fs.writeFileSync(
    path.join(evidenceDir, "stray-notes.md"),
    "# no front-matter\njust notes\n"
  );
  fs.writeFileSync(
    path.join(evidenceDir, "bad-reference.md"),
    [
      "---",
      "engagement: 2026-test",
      "supports:",
      "  TEST: [C-404]",
      "  NOPE: [X-1]",
      "  controls: [policies/missing]",
      "---",
      "",
      "Body.",
    ].join("\n")
  );
});

function run(args) {
  return execFileSync(process.execPath, [BIN, ...args], {
    cwd: FIXTURES,
    encoding: "utf8",
    stdio: "pipe",
  });
}

test("evidence coverage reports covered and uncovered criteria", () => {
  const output = run(["evidence", "coverage", "--dir", evidenceDir]);
  assert.match(output, /2 evidence item\(s\)/);
  assert.match(output, /TEST — Test Standard: 1\/2 criteria have evidence/);
  assert.match(output, /NO EVIDENCE C-2/);
  assert.doesNotMatch(output, /NO EVIDENCE C-1\b/);
});

test("evidence coverage flags unknown references", () => {
  const output = run(["evidence", "coverage", "--dir", evidenceDir]);
  assert.match(output, /UNKNOWN REFERENCE bad-reference\.md: TEST C-404/);
  assert.match(output, /UNKNOWN REFERENCE bad-reference\.md: standard NOPE/);
  assert.match(
    output,
    /UNKNOWN REFERENCE bad-reference\.md: control policies\/missing/
  );
});

test("engagement filter excludes other engagements", () => {
  const output = run([
    "evidence",
    "coverage",
    "--dir",
    evidenceDir,
    "--engagement",
    "2027-none",
  ]);
  assert.match(output, /0 evidence item\(s\) for engagement 2027-none/);
  assert.match(output, /0\/2 criteria have evidence/);
});

test("--json emits the machine-readable coverage", () => {
  const coverage = JSON.parse(
    run(["evidence", "coverage", "--dir", evidenceDir, "--json"])
  );
  const testStandard = coverage.standards.find((s) => s.key === "TEST");
  const c1 = testStandard.criteria.find((c) => c.id === "C-1");
  assert.deepEqual(c1.evidence, [path.join("evidence", "c-1", "export.md")]);
});

test("--fail-on-missing exits non-zero when criteria lack evidence", () => {
  assert.throws(
    () =>
      run([
        "evidence",
        "coverage",
        "--dir",
        evidenceDir,
        "--fail-on-missing",
      ]),
    (error) => error.status === 1 && /criteria lack evidence/.test(error.stderr)
  );
});
