// Scaffolds a new compliance program repository from a template repository.
//
// Templates are ordinary git repositories — the engine embeds no content.
// A curated list is published at a well-known location (templates.json on
// the main branch of pmarkert/push-to-comply), but any repository works:
// public, private (cloning uses the user's own git credentials/SSH), or a
// local path. Anyone can build and share template repositories for
// different standards or industries.

import fs from "fs";
import path from "path";
import { promisify } from "util";
import child_process from "child_process";
import yaml from "js-yaml";

const execFile = promisify(child_process.execFile);

export const DEFAULT_REGISTRY =
  "https://raw.githubusercontent.com/pmarkert/push-to-comply/main/templates.json";

export async function fetchTemplateRegistry(
  url = process.env.PTC_TEMPLATE_REGISTRY ?? DEFAULT_REGISTRY
) {
  // Local files (handy for testing and air-gapped setups)
  if (url.startsWith("file:")) {
    return JSON.parse(fs.readFileSync(new URL(url), "utf8"));
  }
  if (fs.existsSync(url)) {
    return JSON.parse(fs.readFileSync(url, "utf8"));
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch template registry ${url}: HTTP ${response.status}`
    );
  }
  return response.json();
}

// "owner/repo" is GitHub shorthand; everything else (https, ssh, file, local
// paths) is passed to git verbatim.
export function resolveTemplateUrl(template) {
  return /^[\w.-]+\/[\w.-]+$/.test(template)
    ? `https://github.com/${template}.git`
    : template;
}

export async function initProgram({
  directory,
  template,
  name,
  short_name,
  skipGit = false,
  log = console.log,
}) {
  if (!directory) {
    throw new Error("Target directory is required");
  }
  if (fs.existsSync(directory) && fs.readdirSync(directory).length) {
    throw new Error(`Directory ${directory} already exists and is not empty`);
  }
  const url = resolveTemplateUrl(template);
  log(`Cloning template ${url} into ${directory}`);
  await execFile("git", ["clone", "--depth", "1", url, directory]);
  // The new program starts with its own history, not the template's.
  fs.rmSync(path.join(directory, ".git"), { recursive: true, force: true });

  const orgFile = path.join(directory, "context", "organization.yaml");
  if ((name || short_name) && fs.existsSync(orgFile)) {
    const organization = yaml.load(fs.readFileSync(orgFile, "utf8")) ?? {};
    if (name) organization.name = name;
    if (short_name) organization.short_name = short_name;
    fs.writeFileSync(orgFile, yaml.dump(organization));
    log(`Updated ${orgFile}`);
  }

  if (!skipGit) {
    try {
      await execFile("git", ["init"], { cwd: directory });
      await execFile("git", ["add", "-A"], { cwd: directory });
      await execFile(
        "git",
        ["commit", "-m", `Initialize compliance program from ${template}`],
        { cwd: directory }
      );
      log("Created a fresh git repository with an initial commit");
    } catch (error) {
      console.warn(
        `Could not create the initial commit (${error.message}); files are in place — commit manually.`
      );
    }
  }

  log(
    `\nDone. Next steps:\n` +
      `  cd ${directory}\n` +
      `  npm install\n` +
      `  npx ptcomply build   # renders the portal into public/\n` +
      `  npx ptcomply gaps    # shows unsatisfied criteria`
  );
}
