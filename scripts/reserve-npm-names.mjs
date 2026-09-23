#!/usr/bin/env node
// Generates minimal placeholder packages that reserve the project's npm names
// (push-to-comply and push2c) before the first real release:
//
//   node scripts/reserve-npm-names.mjs [--out dist/npm-placeholders]
//
// Each placeholder is version 0.0.0 with no dependencies; its push2c command
// explains that the name is reserved. The first real release (0.1.0) becomes
// the `latest` dist-tag and supersedes it. See RELEASING.md.

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PLACEHOLDER_VERSION = "0.0.0";
const HOMEPAGE = "https://github.com/push-to-comply/push-to-comply";

const { values } = parseArgs({
  options: {
    out: { type: "string", default: path.join("dist", "npm-placeholders") },
  },
});
const outRoot = path.resolve(ROOT, values.out);

const NOTICE = `This npm name is reserved for push-to-comply, which manages a compliance
program (policies, narratives, and procedures) as git artifacts mapped to
framework criteria. The first release is not published yet.

Follow ${HOMEPAGE} for the release.`;

function writePlaceholder(name) {
  const target = path.join(outRoot, name);
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.join(target, "bin"), { recursive: true });

  fs.writeFileSync(
    path.join(target, "package.json"),
    JSON.stringify(
      {
        name,
        version: PLACEHOLDER_VERSION,
        description:
          "Reserved for push-to-comply (compliance programs as git artifacts). First release coming soon.",
        bin: { push2c: "bin/push2c.js" },
        files: ["bin"],
        homepage: HOMEPAGE,
        repository: {
          type: "git",
          url: "git+https://github.com/push-to-comply/push-to-comply.git",
        },
        license: "ISC",
      },
      null,
      2
    ) + "\n"
  );
  fs.writeFileSync(
    path.join(target, "bin", "push2c.js"),
    `#!/usr/bin/env node\nconsole.error(${JSON.stringify(NOTICE)});\nprocess.exitCode = 1;\n`,
    { mode: 0o755 }
  );
  fs.writeFileSync(
    path.join(target, "README.md"),
    `# ${name}\n\n${NOTICE}\n`
  );
  return target;
}

const dirs = ["push-to-comply", "push2c"].map(writePlaceholder);

console.log(`Placeholder packages (version ${PLACEHOLDER_VERSION}):`);
for (const dir of dirs) console.log(`  ${dir}`);
console.log(`
To reserve the names (requires npm login):
${dirs.map((d) => `  (cd ${path.relative(process.cwd(), d)} && npm publish --access public)`).join("\n")}
`);
