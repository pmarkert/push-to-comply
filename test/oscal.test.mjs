import { test } from "node:test";
import assert from "node:assert/strict";
import { convertOscalCatalog } from "../.github/actions/oscal.mjs";

const fixture = {
  catalog: {
    uuid: "00000000-0000-0000-0000-000000000000",
    metadata: { title: "Example Catalog Rev 5" },
    groups: [
      {
        id: "ac",
        title: "Access Control",
        controls: [
          {
            id: "ac-1",
            title: "Policy and Procedures",
            params: [
              { id: "ac-1_prm_1", label: "organization-defined personnel" },
            ],
            parts: [
              {
                name: "statement",
                prose:
                  "Disseminate to {{ insert: param, ac-1_prm_1 }} an access control policy.",
                parts: [
                  { name: "item", prose: "Review it annually." },
                ],
              },
            ],
            controls: [
              {
                id: "ac-1.1",
                title: "Enhancement One",
                parts: [{ name: "statement", prose: "An enhancement." }],
              },
            ],
          },
          {
            id: "ac-2",
            title: "Withdrawn Control",
            props: [{ name: "status", value: "withdrawn" }],
          },
        ],
      },
    ],
  },
};

test("converts an OSCAL catalog into the internal standard shape", () => {
  const { title, standard } = convertOscalCatalog(fixture, "NIST-800-53");
  assert.equal(title, "Example Catalog Rev 5");
  assert.equal(standard.name, "NIST-800-53");
  assert.equal(standard["AC-1"].family, "Access Control");
  assert.equal(standard["AC-1"].name, "Policy and Procedures");
  assert.match(standard["AC-1"].description, /access control policy/);
  assert.match(standard["AC-1"].description, /Review it annually/);
});

test("resolves organization-defined parameter insertions", () => {
  const { standard } = convertOscalCatalog(fixture, "NIST-800-53");
  assert.match(
    standard["AC-1"].description,
    /Disseminate to \[organization-defined personnel\]/
  );
  assert.doesNotMatch(standard["AC-1"].description, /insert: param/);
});

test("includes control enhancements as their own criteria", () => {
  const { standard } = convertOscalCatalog(fixture, "NIST-800-53");
  assert.equal(standard["AC-1.1"].name, "Enhancement One");
});

test("excludes withdrawn controls", () => {
  const { standard } = convertOscalCatalog(fixture, "NIST-800-53");
  assert.equal(standard["AC-2"], undefined);
});

test("rejects non-catalog documents", () => {
  assert.throws(() => convertOscalCatalog({ foo: 1 }, "X"), /OSCAL catalog/);
});
