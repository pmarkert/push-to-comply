import { test } from "node:test";
import assert from "node:assert/strict";
import { DateTime } from "luxon";
import templates from "../.github/actions/templates.mjs";

// These tests run from the repository root and exercise the real content in
// controls/ and context/.

test("loadTemplate parses front-matter metadata", () => {
  const template = templates.loadTemplate("controls/procedures", "patch");
  assert.equal(template.id, "patch");
  assert.equal(template.metadata.cron, "0 0 * * MON#1");
  assert.ok(template.metadata.github.milestone);
});

test("loadTemplate throws for a missing template", () => {
  assert.throws(
    () => templates.loadTemplate("controls/procedures", "does-not-exist"),
    /not found/
  );
});

test("merge renders date context for the given moment", () => {
  const template = templates.loadTemplate("controls/procedures", "patch");
  const merged = template.merge({}, DateTime.fromISO("2024-05-15T10:00:00Z", { zone: "utc" }));
  assert.equal(merged.title, "Apply OS patches for 2024-05");
  assert.equal(merged.github.milestone, "2024-05");
});

test("merge substitutes provided dynamic fields", () => {
  const template = templates.loadTemplate(
    "controls/procedures/employee",
    "onboarding"
  );
  const merged = template.merge({ username: "jdoe" });
  assert.equal(merged.title, "Onboard New User jdoe");
});

test("merge in strict mode throws when a dynamic field is missing", () => {
  const template = templates.loadTemplate(
    "controls/procedures/employee",
    "onboarding"
  );
  assert.throws(() => template.merge({}));
});

test("dynamic_field_placeholders stubs only declared dynamic fields", () => {
  const template = templates.loadTemplate(
    "controls/procedures/employee",
    "onboarding"
  );
  const placeholders = template.dynamic_field_placeholders();
  assert.deepEqual(placeholders, { username: "{{username}}" });
});

test("generate_dynamic_placeholders also stubs date fields", () => {
  const template = templates.loadTemplate(
    "controls/procedures/employee",
    "onboarding"
  );
  const placeholders = template.generate_dynamic_placeholders();
  assert.equal(placeholders.username, "{{username}}");
  assert.equal(placeholders.today, "{{today}}");
});

test("loadTemplates recurses into subdirectories", () => {
  const all = templates.loadTemplates("controls", "procedures");
  const ids = all.map((t) => t.id);
  assert.ok(ids.includes("procedures/patch"));
  assert.ok(ids.includes("procedures/employee/onboarding"));
});
