import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyAutomation,
  AUTOMATION_LABEL,
} from "../lib/tickets.mjs";

const base = {
  id: "procedures/review",
  body: "- [ ] do the thing",
  github: { owner: "o", repo: "r", labels: ["x"] },
};

test("procedures without automation pass through untouched", () => {
  assert.equal(applyAutomation(base), base);
});

test("automation appends agent instructions and the automation label", () => {
  const procedure = applyAutomation({
    ...base,
    automation: {
      mode: "assist",
      instructions: "Compare the lists.",
      evidence: ["Comparison table"],
    },
  });
  assert.match(procedure.body, /^- \[ \] do the thing/);
  assert.match(
    procedure.body,
    /<!-- ptcomply:automation mode="assist" procedure="procedures\/review" -->/
  );
  assert.match(procedure.body, /## Agent Instructions/);
  assert.match(procedure.body, /never close this ticket/);
  assert.match(procedure.body, /Compare the lists\./);
  assert.match(procedure.body, /### Expected evidence\n\n- Comparison table/);
  assert.deepEqual(procedure.github.labels, ["x", AUTOMATION_LABEL]);
});

test("mode defaults to assist and execute is honored", () => {
  const assist = applyAutomation({
    ...base,
    automation: { instructions: "i" },
  });
  assert.match(assist.body, /mode="assist"/);
  assert.match(assist.body, /take no actions that change systems/);

  const execute = applyAutomation({
    ...base,
    automation: { mode: "execute", instructions: "i" },
  });
  assert.match(execute.body, /mode="execute"/);
  assert.match(execute.body, /perform the actions below/);
});

test("unknown automation modes are rejected", () => {
  assert.throws(
    () =>
      applyAutomation({
        ...base,
        automation: { mode: "yolo", instructions: "i" },
      }),
    /automation\.mode must be one of assist, execute/
  );
});
