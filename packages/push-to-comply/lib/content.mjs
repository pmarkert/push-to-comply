// Loads compliance content (controls and standards) and computes
// control-to-criteria mappings and coverage statistics. Shared by the site
// builder and the gap reporter.

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import templates from "./templates.mjs";
import { convertOscalCatalog } from "./oscal.mjs";

export function loadControls(context) {
  const load = (subdir, type) =>
    templates
      .loadTemplates(context.config.controls_directory, subdir)
      .map((template) => ({
        // Include dynamic placeholders since we are rendering as a document
        ...template.merge(template.generate_dynamic_placeholders()),
        metadata: template.metadata,
      }))
      .map((control) => ({
        ...control,
        name: `${control.name ?? control.title ?? control.id}`,
        type,
      }));

  const procedures = load(context.config.procedures_subdirectory, "procedure");
  const narratives = load(context.config.narratives_subdirectory, "narrative");
  const policies = load(context.config.policies_subdirectory, "policy");
  return {
    procedures,
    narratives,
    policies,
    controls: [...policies, ...narratives, ...procedures],
  };
}

function loadMarkdownStandards(context) {
  return templates
    .loadTemplates("", context.config.standards_directory)
    .map((template) => ({
      ...template.merge({
        name:
          template.metadata.name ?? template.metadata.description ?? template.id,
      }),
    }));
}

function loadYamlStandards(context) {
  return fs
    .readdirSync(context.config.standards_directory)
    .filter((f) => templates.YAML_EXTENSIONS.includes(path.extname(f)))
    .map((f) => {
      const standard = yaml.load(
        fs.readFileSync(
          path.join(context.config.standards_directory, f),
          "utf8"
        )
      );
      return {
        id: path.join(
          context.config.standards_directory,
          path.basename(f, path.extname(f))
        ),
        name: standard.name,
        body: "",
        standard,
      };
    });
}

// OSCAL catalogs (e.g. NIST SP 800-53 from usnistgov/oscal-content) dropped
// into the standards directory as .json files. The mapping key used in
// `satisfies` metadata is the filename (without extension).
function loadOscalStandards(context) {
  return fs
    .readdirSync(context.config.standards_directory)
    .filter((f) => path.extname(f) === ".json")
    .map((f) => {
      const mapping_name = path.basename(f, ".json");
      const catalog = JSON.parse(
        fs.readFileSync(
          path.join(context.config.standards_directory, f),
          "utf8"
        )
      );
      const converted = convertOscalCatalog(catalog, mapping_name);
      return {
        id: path.join(context.config.standards_directory, mapping_name),
        name: converted.title,
        body: "",
        standard: converted.standard,
      };
    });
}

export function applyControlMappings(standard, controls) {
  return Object.entries(standard)
    .filter(([key]) => key !== "name")
    .map(([id, criterion]) => ({
      ...criterion,
      id,
      controls: controls.filter((control) =>
        (control.satisfies?.[standard.name] ?? []).includes(id)
      ),
    }))
    .reduce((families, criterion) => {
      const family = (families[criterion.family] = {
        ...families[criterion.family],
        criteria: [...(families[criterion.family]?.criteria ?? []), criterion],
      });
      family.stats = {
        total: family.criteria.length,
        satisfied: family.criteria.filter((c) => c.controls.length).length,
      };
      family.stats.percent = Math.round(
        (family.stats.satisfied / family.stats.total) * 100
      );
      return families;
    }, {});
}

export function loadStandards(context, controls) {
  return loadMarkdownStandards(context)
    .concat(loadYamlStandards(context))
    .concat(loadOscalStandards(context))
    .map((standard) => ({
      ...standard,
      mappings: applyControlMappings(standard.standard, controls),
    }))
    .map((standard) => {
      const criteria = Object.values(standard.mappings).flatMap(
        (family) => family.criteria
      );
      const satisfied = criteria.filter((c) => c.controls.length).length;
      return {
        ...standard,
        stats: {
          total: criteria.length,
          satisfied,
          percent: Math.round((satisfied / (criteria.length || 1)) * 100),
        },
      };
    });
}

// Machine-readable snapshot of the whole compliance program (for agents,
// dashboards, and external tooling).
export function complianceSummary(context, standards, controls) {
  const summarized = standards.map((standard) => {
    const families = Object.fromEntries(
      Object.entries(standard.mappings).map(([family, data]) => [
        family,
        {
          stats: data.stats,
          criteria: data.criteria.map((criterion) => ({
            id: criterion.id,
            name: criterion.name,
            description: criterion.description,
            satisfied: criterion.controls.length > 0,
            controls: criterion.controls.map((control) => control.id),
          })),
        },
      ])
    );
    const criteria = Object.values(families).flatMap((f) => f.criteria);
    return {
      id: standard.id,
      key: standard.standard.name,
      name: standard.name,
      page: `${standard.id}.html`,
      stats: {
        total: criteria.length,
        satisfied: criteria.filter((c) => c.satisfied).length,
      },
      unsatisfied: criteria.filter((c) => !c.satisfied).map((c) => c.id),
      families,
    };
  });
  return {
    generated_at: new Date().toISOString(),
    organization: context.organization,
    standards: summarized,
    controls: controls.map((control) => ({
      id: control.id,
      type: control.type,
      name: control.name,
      page: `${control.id}.html`,
      owner: control.owner,
      version: control.version,
      approval_date: control.approval_date,
      satisfies: control.satisfies,
      cron: control.cron,
      dynamic_fields: control.metadata?.dynamic_fields,
    })),
  };
}
