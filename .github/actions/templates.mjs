import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import Handlebars from "handlebars";
import markdownIt from "markdown-it";
import cronstrue from "cronstrue";
import { DateTime } from "luxon";

const MARKDOWN_EXTENSIONS = [
  ".markdown",
  ".mdown",
  ".mkdn",
  ".mkd",
  ".mdwn",
  ".md",
];
const YAML_EXTENSIONS = [".yaml", ".yml"];

Handlebars.registerHelper("markdown", function (options) {
  return new markdownIt().render(options.fn(this));
});

Handlebars.registerHelper("cronstrue", function (context) {
  return cronstrue.toString(context);
});

Handlebars.registerHelper("if_equals", function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});
// The regex to parse the front-matter and body
const FRONTMATTER_REGEX =
  /^((---\n)?(?<front_matter>[\s\S]+?)\n---\n)?(?<body>[\s\S]+?)$/;

// Load context data
const contextDataCache = {};

function environmentContext() {
  return {
    github: {
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
    },
    config: {
      ticket_safety_limit: process.env.TICKET_SAFETY_LIMIT ?? 3,
      controls_directory: process.env.CONTROLS_DIRECTORY ?? "controls",
      standards_directory: process.env.STANDARDS_DIRECTORY ?? "standards",
      procedures_subdirectory:
        process.env.PROCEDURES_SUBDIRECTORY ?? "procedures",
      narratives_subdirectory:
        process.env.NARRATIVES_SUBDIRECTORY ?? "narratives",
      policies_subdirectory: process.env.POLICIES_SUBDIRECTORY ?? "policies",
      layouts_directory: process.env.LAYOUTS_DIRECTORY ?? "layouts",
      assets_directory: process.env.ASSETS_DIRECTORY ?? "assets",
      output_directory: process.env.OUTPUT_DIRECTORY ?? "public",
      issue_label: process.env.ISSUE_LABEL ?? "push-to-comply",
      start_of_compliance: process.env.START_OF_COMPLIANCE,
    },
  };
}

function staticContext(folder = "./context") {
  const environment_context = environmentContext();
  if (!contextDataCache[folder]) {
    contextDataCache[folder] = {
      ...environment_context,
      ...Object.fromEntries(
        fs
          .readdirSync(folder)
          .filter((file) => YAML_EXTENSIONS.includes(path.extname(file)))
          .map((file) => [
            path.basename(file, path.extname(file)),
            {
              ...environment_context[path.basename(file, path.extname(file))],
              ...yaml.load(fs.readFileSync(path.join(folder, file))),
            },
          ])
      ),
    };
  }
  return contextDataCache[folder];
}

function dateContext(dt = DateTime.now()) {
  function build_formatter(lambda, format) {
    return () => {
      const result = (body) => lambda().toFormat(body || format);
      result.toString = result;
      return result;
    };
  }

  return {
    now: build_formatter(() => dt, "HH:mm:ss"),
    today: build_formatter(() => dt.startOf("day"), "yyyy-MM-dd"),
    tomorrow: build_formatter(
      () => dt.startOf("day").plus({ days: 1 }),
      "yyyy-MM-dd"
    ),
    yesterday: build_formatter(
      () => dt.startOf("day").minus({ days: 1 }),
      "yyyy-MM-dd"
    ),
    this_week: build_formatter(
      () => dt.startOf("week"),
      "'Week of' yyyy-MM-dd"
    ),
    next_week: build_formatter(
      () => dt.startOf("week").plus({ weeks: 1 }),
      "'Week of' yyyy-MM-dd"
    ),
    last_week: build_formatter(
      () => dt.startOf("week").minus({ weeks: 1 }),
      "'Week of' yyyy-MM-dd"
    ),
    this_month: build_formatter(() => dt.startOf("month"), "yyyy-MM"),
    next_month: build_formatter(
      () => dt.startOf("month").plus({ months: 1 }),
      "yyyy-MM"
    ),
    last_month: build_formatter(
      () => dt.startOf("month").minus({ months: 1 }),
      "yyyy-MM"
    ),
    this_quarter: build_formatter(() => dt.startOf("quarter"), "yyyy-'Q'q"),
    next_quarter: build_formatter(
      () => dt.startOf("quarter").plus({ quarters: 1 }),
      "yyyy-'Q'q"
    ),
    last_quarter: build_formatter(
      () => dt.startOf("quarter").minus({ quarters: 1 }),
      "yyyy-'Q'q"
    ),
    this_year: build_formatter(() => dt.startOf("year"), "yyyy"),
    next_year: build_formatter(
      () => dt.startOf("year").plus({ years: 1 }),
      "yyyy"
    ),
    last_year: build_formatter(
      () => dt.startOf("year").minus({ years: 1 }),
      "yyyy"
    ),
  };
}

function mergeContext(dynamicContext = {}, dt = DateTime.now()) {
  return {
    ...staticContext(),
    ...dateContext(dt),
    ...dynamicContext,
  };
}

// Load and render the template in the first pass to extract the cron expression
const loadTemplate = (base_directory, id) => {
  const filename = MARKDOWN_EXTENSIONS.map((ext) =>
    path.join(base_directory, `${id}${ext}`)
  ).find(fs.existsSync);

  if (!filename) {
    console.error(`Template ${id} not found.`);
    process.exit(1);
  }

  const source = fs.readFileSync(filename, "utf8");

  const parsed = FRONTMATTER_REGEX.exec(source);

  function merge(dynamicContext = {}, dt = DateTime.now()) {
    const localContext = mergeContext(dynamicContext, dt);
    const parsed = FRONTMATTER_REGEX.exec(
      Handlebars.compile(source, { strict: true })(localContext)
    );
    if (!parsed || !parsed.groups) {
      console.error(`Failed to parse front matter or body for template: ${id}`);
      process.exit(1);
    }
    const metadata = yaml.load(parsed.groups.front_matter || "{}");
    return {
      id,
      ...dynamicContext,
      ...{
        ...metadata,
        github: { ...localContext.github, ...metadata.github },
      },
      body: parsed.groups.body.trim(),
    };
  }

  function generate_dynamic_placeholders() {
    return {
      ...Object.fromEntries(
        (this.metadata.dynamic_fields ?? []).map((field) => [
          field,
          `{{${field}}}`,
        ])
      ),
      ...Object.fromEntries(
        Object.keys(dateContext()).map((field) => [field, `{{${field}}}`])
      ),
    };
  }

  return {
    id,
    source,
    filename,
    generate_dynamic_placeholders,
    metadata: yaml.load(parsed.groups.front_matter || "{}"),
    merge,
  };
};

// Load all templates from the procedures folder
function loadTemplates(folder, relativePath = "") {
  const templateFiles = fs.readdirSync(path.join(folder, relativePath));

  return [
    // templates in this folder
    ...templateFiles
      .filter((file) => MARKDOWN_EXTENSIONS.includes(path.extname(file)))
      .map((file) =>
        loadTemplate(
          folder,
          path.join(relativePath, path.basename(file, path.extname(file)))
        )
      ),
    // subfolders
    ...templateFiles
      .filter((file) =>
        fs.statSync(path.join(folder, relativePath, file)).isDirectory()
      )
      .flatMap(
        (subfolder) =>
          loadTemplates(folder, path.join(relativePath, subfolder)) ?? []
      ),
  ];
}

export default {
  loadTemplate,
  loadTemplates,
  mergeContext,
  environmentContext,
  staticContext,
  dateContext,
  MARKDOWN_EXTENSIONS,
  YAML_EXTENSIONS,
};
