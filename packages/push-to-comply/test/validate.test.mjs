import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/ptcomply.mjs", import.meta.url));
const FIXTURES = fileURLToPath(new URL("./fixtures", import.meta.url));

function run(args, options = {}) {
  return execFileSync(process.execPath, [BIN, ...args], {
    encoding: "utf8",
    stdio: "pipe",
    ...options,
  });
}

test("validate passes on the clean fixture content", () => {
  const output = run(["validate"], { cwd: FIXTURES });
  assert.match(output, /Content is valid/);
});

test("validate reports unknown standards and criterion ids", () => {
  const broken = fs.mkdtempSync(path.join(os.tmpdir(), "ptc-validate-"));
  fs.cpSync(FIXTURES, broken, { recursive: true });
  fs.writeFileSync(
    path.join(broken, "controls/policies/broken.md"),
    [
      "---",
      "name: Broken Policy",
      "satisfies:",
      "  NOPE:",
      "    - X-1",
      "  TEST:",
      "    - C-999",
      "---",
      "",
      "Body.",
    ].join("\n")
  );

  let failed = false;
  try {
    run(["validate"], { cwd: broken });
  } catch (error) {
    failed = true;
    assert.equal(error.status, 1);
    assert.match(String(error.stderr), /unknown standard "NOPE"/);
    assert.match(String(error.stderr), /known: TEST/);
    assert.match(
      String(error.stderr),
      /criterion "C-999" which is not defined/
    );
  }
  assert.ok(failed, "validate should have exited non-zero");
});
