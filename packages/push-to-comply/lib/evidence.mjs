// Cross-references an evidence repository against the compliance program.
//
// Evidence repositories are separate, engagement-scoped git repositories
// (see docs/evidence-architecture.md). Any markdown file in one may declare
// what it supports using the same vocabulary as controls' `satisfies`:
//
//   ---
//   name: March access review export
//   engagement: 2026-soc2
//   date: 2026-03-02
//   source: GitHub org member API
//   collector: alice
//   supports:
//     TSC: [CC6.2, CC6.3]
//     controls: [procedures/access_review]
//   ---
//
// Keys under `supports` are standard mapping keys; the reserved key
// `controls` references control ids.

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import templates from "./templates.mjs";
import { loadControls, loadStandards } from "./content.mjs";

const FRONTMATTER_REGEX =
  /^((---\n)?(?<front_matter>[\s\S]+?)\n---\n)?(?<body>[\s\S]+?)$/;
const SKIP_DIRECTORIES = new Set([".git", "node_modules"]);

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRECTORIES.has(entry.name)) {
        yield* walk(path.join(directory, entry.name));
      }
    } else if (
      templates.MARKDOWN_EXTENSIONS.includes(path.extname(entry.name))
    ) {
      yield path.join(directory, entry.name);
    }
  }
}

export function loadEvidence(directory) {
  if (!fs.existsSync(directory)) {
    throw new Error(`Evidence directory not found: ${directory}`);
  }
  const items = [];
  for (const file of walk(directory)) {
    const parsed = FRONTMATTER_REGEX.exec(fs.readFileSync(file, "utf8"));
    let metadata;
    try {
      metadata = yaml.load(parsed?.groups?.front_matter ?? "") ?? {};
    } catch (error) {
      items.push({ file: path.relative(directory, file), error: error.message });
      continue;
    }
    if (metadata.supports) {
      items.push({ ...metadata, file: path.relative(directory, file) });
    }
  }
  return items;
}

export function evidenceCoverage(
  context = templates.mergeContext(),
  evidence,
  { engagement } = {}
) {
  const selected = evidence.filter(
    (item) => !item.error && (!engagement || item.engagement === engagement)
  );
  const { controls } = loadControls(context);
  const standards = loadStandards(context, controls);
  const controlIds = new Set(controls.map((control) => control.id));
  const unknown = [];

  const byStandard = standards.map((standard) => {
    const key = standard.standard.name;
    const criteria = Object.values(standard.mappings)
      .flatMap((family) => family.criteria)
      .map((criterion) => ({
        id: criterion.id,
        name: criterion.name,
        satisfied: criterion.controls.length > 0,
        evidence: selected
          .filter((item) => (item.supports?.[key] ?? []).includes(criterion.id))
          .map((item) => item.file),
      }));
    return {
      key,
      name: standard.name,
      stats: {
        total: criteria.length,
        with_evidence: criteria.filter((c) => c.evidence.length).length,
      },
      criteria,
    };
  });

  const knownCriteria = Object.fromEntries(
    standards.map((standard) => [
      standard.standard.name,
      new Set(
        Object.keys(standard.standard).filter((k) => k !== "name")
      ),
    ])
  );
  for (const item of selected) {
    for (const [key, ids] of Object.entries(item.supports ?? {})) {
      if (key === "controls") {
        for (const id of ids ?? []) {
          if (!controlIds.has(id)) {
            unknown.push({ file: item.file, reference: `control ${id}` });
          }
        }
      } else if (!knownCriteria[key]) {
        unknown.push({ file: item.file, reference: `standard ${key}` });
      } else {
        for (const id of ids ?? []) {
          if (!knownCriteria[key].has(id)) {
            unknown.push({ file: item.file, reference: `${key} ${id}` });
          }
        }
      }
    }
  }

  return {
    engagement: engagement ?? null,
    evidence_count: selected.length,
    standards: byStandard,
    unknown_references: unknown,
    malformed: evidence.filter((item) => item.error),
  };
}
