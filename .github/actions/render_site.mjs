import fs from "fs";
import path from "path";
import templates from "./templates.mjs";
import Handlebars from "handlebars";
import yaml from "js-yaml";

const MARKDOWN_EXTENSIION_PATTERN = new RegExp(
  "\\" + templates.MARKDOWN_EXTENSIONS.join("|") + "$"
);
const MARKDOWN_HYPERLINK = /\[(?<text>[^\]]+)\]\((?<link>[^)]+)\)/g;

Array.prototype.sideEffect = function (callback) {
  this.forEach(callback);
  return this;
};

Array.prototype.map_by = function (callback, mapper = (e) => e) {
  return Object.fromEntries(this.map((e) => [callback(e), mapper(e)]));
};

function log(...message) {
  !process.env["QUIET"] && console.log(...message);
}

function loadLayouts() {
  return fs
    .readdirSync(context.config.layouts_directory)
    .filter((f) => path.extname(f) === ".html")
    .map((f) => ({
      name: path.basename(f, path.extname(f)),
      template: fs.readFileSync(
        path.join(context.config.layouts_directory, f),
        "utf8"
      ),
    }))
    .sideEffect((f) => {
      Handlebars.registerPartial(f.name, f.template);
      f.render = Handlebars.compile(f.template, { strict: true });
    })
    .map_by((f) => f.name);
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
        .replace(MARKDOWN_EXTENSIION_PATTERN, ".html")
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
  return templates
    .loadTemplates(context.config.controls_directory, template_dir)
    .map((template) =>
      // Include dynamic placeholders since we are rendering as a document
      template.merge(template.generate_dynamic_placeholders())
    )
    .map((control) => ({
      ...control,
      name: `${control.name ?? control.title ?? control.id}`,
      type,
    }))
    .sideEffect((control) =>
      writePage(control.id, renderControlPage(control, "control"))
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
        fs.readFileSync(path.join(STANDARDS_DIR, f), "utf8")
      );
      return {
        id: f,
        name: standard.name,
        body: "",
        standard,
      };
    });
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
console.log(context);
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
const standards = templates
  .loadTemplates("", context.config.standards_directory)
  .map((template) => ({
    ...template.merge({
      name:
        template.metadata.name ?? template.metadata.description ?? template.id,
    }),
  }))
  .concat(loadYamlStandards())
  .sideEffect((standard) =>
    writePage(
      standard.id,
      renderControlPage(
        {
          ...standard,
          mappings: applyControlMappings(standard.standard, controls),
        },
        "standard"
      )
    )
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
