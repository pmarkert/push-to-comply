// Validates the compliance content: every `satisfies` mapping must reference
// a known standard (by its mapping key) and criterion ids that exist in that
// standard. Content that fails to load at all (malformed front-matter,
// unknown Handlebars macros) is reported per-file rather than crashing the
// whole run.

import templates from "./templates.mjs";
import { loadControls, loadStandards } from "./content.mjs";
import { AUTOMATION_MODES } from "./tickets.mjs";

export function validateContent(context = templates.mergeContext()) {
  const errors = [];

  let controls = [];
  try {
    ({ controls } = loadControls(context));
  } catch (error) {
    errors.push(`Failed to load controls: ${error.message}`);
    return { errors };
  }

  let standards = [];
  try {
    standards = loadStandards(context, controls);
  } catch (error) {
    errors.push(`Failed to load standards: ${error.message}`);
    return { errors };
  }

  const known = Object.fromEntries(
    standards.map((standard) => [
      standard.standard.name,
      new Set(Object.keys(standard.standard).filter((key) => key !== "name")),
    ])
  );

  const duplicates = standards
    .map((s) => s.standard.name)
    .filter((name, i, all) => all.indexOf(name) !== i);
  for (const name of new Set(duplicates)) {
    errors.push(`Multiple standards share the mapping key "${name}"`);
  }

  for (const control of controls) {
    for (const [key, criteria] of Object.entries(control.satisfies ?? {})) {
      if (!known[key]) {
        errors.push(
          `${control.id}: satisfies unknown standard "${key}" (known: ${
            Object.keys(known).join(", ") || "none"
          })`
        );
        continue;
      }
      for (const criterion of criteria ?? []) {
        if (!known[key].has(criterion)) {
          errors.push(
            `${control.id}: satisfies ${key} criterion "${criterion}" which is not defined in that standard`
          );
        }
      }
    }
  }

  for (const control of controls) {
    const automation = control.automation;
    if (!automation) continue;
    if (control.type !== "procedure") {
      errors.push(`${control.id}: automation is only valid on procedures`);
    }
    if (automation.mode && !AUTOMATION_MODES.includes(automation.mode)) {
      errors.push(
        `${control.id}: automation.mode must be one of ${AUTOMATION_MODES.join(", ")} (got "${automation.mode}")`
      );
    }
    if (!automation.instructions) {
      errors.push(`${control.id}: automation requires instructions`);
    }
  }

  return { errors };
}
