// Renders the static documentation portal. Layouts and assets resolve from
// the engine's bundled defaults first, overlaid by any same-named files in
// the content repository — so a content repo needs no layouts of its own but
// can override any of them.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import templates from "./templates.mjs";
import { loadControls, loadStandards, complianceSummary } from "./content.mjs";

const DEFAULTS_DIR = fileURLToPath(new URL("../defaults/", import.meta.url));

const MARKDOWN_EXTENSION_PATTERN = new RegExp(
  `(${templates.MARKDOWN_EXTENSIONS.map((ext) => "\\" + ext).join("|")})$`
);
const MARKDOWN_HYPERLINK = /\[(?<text>[^\]]+)\]\((?<link>[^)]+)\)/g;

function log(...message) {
  !process.env["QUIET"] && console.log(...message);
}

function layoutFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }
  return fs
    .readdirSync(directory)
    .filter((f) => path.extname(f) === ".html")
    .map((f) => ({
      name: path.basename(f, path.extname(f)),
      template: fs.readFileSync(path.join(directory, f), "utf8"),
    }));
}

function loadLayouts(context) {
  // Engine defaults first, then content-repo overrides (same name wins).
  const merged = {};
  for (const f of [
    ...layoutFiles(path.join(DEFAULTS_DIR, "layouts")),
    ...layoutFiles(context.config.layouts_directory),
  ]) {
    merged[f.name] = f;
  }
  for (const f of Object.values(merged)) {
    Handlebars.registerPartial(f.name, f.template);
    f.render = Handlebars.compile(f.template, { strict: true });
  }
  return merged;
}

function copyAssets(context) {
  const target = path.join(
    context.config.output_directory,
    context.config.assets_directory
  );
  fs.cpSync(path.join(DEFAULTS_DIR, "assets"), target, { recursive: true });
  if (fs.existsSync(context.config.assets_directory)) {
    fs.cpSync(context.config.assets_directory, target, { recursive: true });
  }
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

export function buildSite(context = templates.mergeContext()) {
  const layouts = loadLayouts(context);

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

  function renderControlPage(control, default_layout) {
    const layout =
      layouts[control.layout ?? control.type] ?? layouts[default_layout];
    return layout.render({
      ...context,
      control: { ...control, body: replaceRelativeLinks(control.body) },
      base: path.dirname(control.id).replace(/\w+/g, ".."),
    });
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

  copyAssets(context);

  const { procedures, narratives, policies, controls } = loadControls(context);
  for (const control of controls) {
    writePage(control.id, renderControlPage(control, "control"));
  }

  const standards = loadStandards(context, controls);
  for (const standard of standards) {
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

  for (const [folder_name, folder_type, control_type, folder_controls] of [
    ["Procedures", "procedures", "procedure", procedures],
    ["Narratives", "narratives", "narrative", narratives],
    ["Policies", "policies", "policy", policies],
  ]) {
    writePage(
      `${folder_type}/index`,
      layouts["folder"].render({
        ...context,
        folder_name,
        folder_type,
        control_type,
        controls: folder_controls,
      })
    );
  }

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

  const summary = complianceSummary(context, standards, controls);
  writeJson("compliance.json", summary);
  return summary;
}
