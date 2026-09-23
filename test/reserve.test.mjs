import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "ptc-reserve-"));
execFileSync(
  process.execPath,
  ["scripts/reserve-npm-names.mjs", "--out", outDir],
  { stdio: "pipe" }
);

for (const name of ["push-to-comply", "push2c"]) {
  test(`${name} placeholder is a dependency-free 0.0.0 package`, () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(outDir, name, "package.json"), "utf8")
    );
    assert.equal(pkg.name, name);
    assert.equal(pkg.version, "0.0.0");
    assert.equal(pkg.dependencies, undefined);
    assert.deepEqual(pkg.bin, { push2c: "bin/push2c.js" });
  });

  test(`${name} placeholder command explains the reservation and exits non-zero`, () => {
    assert.throws(
      () =>
        execFileSync(
          process.execPath,
          [path.join(outDir, name, "bin", "push2c.js")],
          { stdio: "pipe" }
        ),
      (error) =>
        error.status === 1 && /reserved for push-to-comply/.test(error.stderr)
    );
  });
}

test("real releases supersede the placeholder version", () => {
  for (const name of ["push-to-comply", "push2c"]) {
    const real = JSON.parse(
      fs.readFileSync(`packages/${name}/package.json`, "utf8")
    ).version;
    assert.notEqual(real, "0.0.0", `${name} must release above 0.0.0`);
  }
});
