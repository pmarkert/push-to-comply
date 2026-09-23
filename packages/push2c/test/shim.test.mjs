import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const readJson = (url) =>
  JSON.parse(fs.readFileSync(fileURLToPath(url), "utf8"));
const shim = readJson(new URL("../package.json", import.meta.url));
const engine = readJson(
  new URL("../../push-to-comply/package.json", import.meta.url)
);

test("shim is versioned in lockstep with the engine and pins it exactly", () => {
  assert.equal(shim.version, engine.version);
  assert.equal(shim.dependencies["push-to-comply"], engine.version);
});

test("shim exposes the same single push2c bin as the engine", () => {
  assert.deepEqual(shim.bin, { push2c: "bin/push2c.mjs" });
  assert.deepEqual(Object.keys(engine.bin), ["push2c"]);
});

test("shim bin runs the engine CLI", () => {
  const output = execFileSync(
    process.execPath,
    [fileURLToPath(new URL("../bin/push2c.mjs", import.meta.url)), "version"],
    { encoding: "utf8" }
  );
  assert.equal(output.trim(), engine.version);
});
