import fs from "fs";
import path from "path";
import templates from "./templates.mjs";
import { convertOscalCatalog } from "./oscal.mjs";
import Handlebars from "handlebars";
import yaml from "js-yaml";

const MARKDOWN_EXTENSION_PATTERN = new RegExp(
  `(${templates.MARKDOWN_EXTENSIONS.map((ext) => "\\" + ext).join("|")})$`
);
const MARKDOWN_HYPERLINK = /\[(?<text>[^\]]+)\]\((?<link>[^)]+)\)/g;

const tap = (array, callback) => {
  array.forEach(callback);
  return array;
};

const indexBy = (array, keyFn) =>
  Object.fromEntries(array.map((e) => [keyFn(e), e]));

function log(...message) {
  !process.env["QUIET"] && console.log(...message);
}

function loadLayouts() {
  return indexBy(
    tap(
      fs
        .readdirSync(context.config.layouts_directory)
        .filter((f) => path.extname(f) === ".html")
        .map((f) => ({
          name: path.basename(f, path.extname(f)),
          template: fs.readFileSync(
            path.join(context.config.layouts_directory, f),
            "utf8"
          ),
        })),
      (f) => {
        Handlebars.registerPartial(f.name, f.template);
        f.render = Handlebars.compile(f.template, { strict: true });
      }
    ),
    (f) => f.name
  );
}

function writePage(filename, content) {
  log("Writing", filename);
  const parent_folder = path.join(
    context.config.output_directory,
    path.dirname(filename)
  );
  if (!fs.existsSync(parent_folder)) {
    fs.mkdirSync(parent_folder, { recursive: true });
  }
  fs.writeFileSync(
    path.join(parent_folder, `${path.basename(filename)}.html`),
    content
  );
}

function writeJson(filename, data) {
  log("Writing", filename);
  fs.writeFileSync(
    path.join(context.config.output_directory, filename),
    JSON.stringify(data, null, 2)
  );
}

function replaceRelativeLinks(body) {
  return body.replace(MARKDOWN_HYPERLINK, (match, text, link) => {
    try {
      new URL(link);
      return match.toString();
    } catch (e) {
      if (!fs.existsSync(link.replace(/^\//, ""))) {
        throw new Error(`Could not find file: ${link}`);
      }
      return `[${text}](${link
        .replace(MARKDOWN_EXTENSION_PATTERN, ".html")
        .replace(/^\/?(controls\/)?/, "")})`;
    }
  });
}

function renderControlPage(control, default_layout) {
  const layout =
    layouts[control.layout ?? control.type] ?? layouts[default_layout];
  return layout.render({
    ...context,
    control: { ...control, body: replaceRelativeLinks(control.body) },
    base: path.dirname(control.id).replace(/\w+/g, ".."),
  });
}

function processControls(template_dir, type) {
  console.log("Processing", template_dir);
  return tap(
    templates
      .loadTemplates(context.config.controls_directory, template_dir)
      .map((template) => ({
        // Include dynamic placeholders since we are rendering as a document
        ...template.merge(template.generate_dynamic_placeholders()),
        metadata: template.metadata,
      }))
      .map((control) => ({
        ...control,
        name: `${control.name ?? control.title ?? control.id}`,
        type,
      })),
    (control) => writePage(control.id, renderControlPage(control, "control"))
  );
}

function organizeControlHierarchy(controls) {
  return controls.reduce((acc, document) => {
    let parent = acc;
    for (const folder of document.id.split("/").slice(1, -1)) {
      let child = parent.find((e) => e.name === folder && e.items);
      if (!child) {
        child = { name: folder, items: [] };
        parent.push(child);
      }
      parent = child.items;
    }
    parent.push(document);
    return acc;
  }, []);
}

function applyControlMappings(standard, controls) {
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

function loadYamlStandards() {
  return fs
    .readdirSync(context.config.standards_directory)
    .filter((f) => templates.YAML_EXTENSIONS.includes(path.extname(f)))
    .map((f) => {
      const standard = yaml.load(
        fs.readFileSync(path.join(context.config.standards_directory, f), "utf8")
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
function loadOscalStandards() {
  return fs
    .readdirSync(context.config.standards_directory)
    .filter((f) => path.extname(f) === ".json")
    .map((f) => {
      const mapping_name = path.basename(f, ".json");
      const catalog = JSON.parse(
        fs.readFileSync(path.join(context.config.standards_directory, f), "utf8")
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

function complianceSummary(standards, controls) {
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

const context = templates.mergeContext();
const layouts = loadLayouts();

// Sync assets
fs.cpSync(
  context.config.assets_directory,
  path.join(context.config.output_directory, context.config.assets_directory),
  { recursive: true }
);

// Load collections
const procedures = processControls(
  context.config.procedures_subdirectory,
  "procedure"
);
const narratives = processControls(
  context.config.narratives_subdirectory,
  "narrative"
);
const policies = processControls(
  context.config.policies_subdirectory,
  "policy"
);
const controls = [...policies, ...narratives, ...procedures];
const standards = tap(
  templates
    .loadTemplates("", context.config.standards_directory)
    .map((template) => ({
      ...template.merge({
        name:
          template.metadata.name ?? template.metadata.description ?? template.id,
      }),
    }))
    .concat(loadYamlStandards())
    .concat(loadOscalStandards())
    .map((standard) => ({
      ...standard,
      mappings: applyControlMappings(standard.standard, controls),
    })),
  (standard) => {
    const page = renderControlPage(standard, "standard");
    writePage(standard.id, page);
    // Controls link to standards by their mapping key (`satisfies` metadata),
    // so also publish the page under that name when it differs from the id.
    const alias = path.join(
      path.dirname(standard.id),
      `${standard.standard.name}`
    );
    if (alias !== standard.id) {
      writePage(alias, page);
    }
  }
);

writePage(
  "procedures/index",
  layouts["folder"].render({
    ...context,
    folder_name: "Procedures",
    folder_type: "procedures",
    control_type: "procedure",
    controls: procedures,
  })
);

writePage(
  "narratives/index",
  layouts["folder"].render({
    ...context,
    folder_name: "Narratives",
    folder_type: "narratives",
    control_type: "narrative",
    controls: narratives,
  })
);

writePage(
  "policies/index",
  layouts["folder"].render({
    ...context,
    folder_name: "Policies",
    folder_type: "policies",
    control_type: "policy",
    controls: policies,
  })
);

writePage(
  "index",
  layouts["index"].render({
    ...context,
    standards,
    policies: organizeControlHierarchy(policies),
    narratives: organizeControlHierarchy(narratives),
    procedures: organizeControlHierarchy(procedures),
  })
);

// Machine-readable snapshot of the whole compliance program (for agents,
// dashboards, and external tooling).
writeJson("compliance.json", complianceSummary(standards, controls));
