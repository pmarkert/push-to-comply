// Loads a NIST OSCAL catalog (JSON) and flattens it into the internal
// "standard" shape used for control mappings:
//   { name: <mapping key>, <CONTROL-ID>: { family, name, description }, ... }
//
// Public-domain OSCAL catalogs (e.g. NIST SP 800-53 rev5) are published at
// https://github.com/usnistgov/oscal-content in JSON/YAML/XML. Drop a catalog
// file into the standards/ directory and controls can reference its ids in
// their `satisfies` metadata under the mapping key (the filename by default).

const PARAM_INSERT = /\{\{\s*insert:\s*param,\s*([^\s}]+)\s*\}\}/g;

function paramText(param) {
  if (param.label) return param.label;
  if (param.select) {
    return `Selection: ${(param.select.choice ?? []).join("; ")}`;
  }
  return param.id;
}

// Replace OSCAL "organization-defined parameter" insertion points with their
// human-readable labels. Selection choices can themselves contain insertion
// points, so resolve a couple of passes deep.
function resolveParams(text, params, depth = 0) {
  if (depth > 3) return text;
  return text.replace(PARAM_INSERT, (match, id) =>
    params[id]
      ? `[${resolveParams(paramText(params[id]), params, depth + 1)}]`
      : match
  );
}

function collectProse(part, depth = 0) {
  if (!part || depth > 6) return [];
  const prose = part.prose ? [part.prose] : [];
  return prose.concat(
    (part.parts ?? []).flatMap((p) => collectProse(p, depth + 1))
  );
}

function controlDescription(control, params) {
  const statement = (control.parts ?? []).find((p) => p.name === "statement");
  return resolveParams(collectProse(statement).join(" ").trim(), params);
}

function isWithdrawn(control) {
  return (control.props ?? []).some(
    (p) => p.name === "status" && p.value === "withdrawn"
  );
}

function collectParams(controls, params = {}) {
  for (const control of controls ?? []) {
    for (const param of control.params ?? []) {
      params[param.id] = param;
    }
    collectParams(control.controls, params);
  }
  return params;
}

function* flattenControls(controls, family, params) {
  for (const control of controls ?? []) {
    if (!isWithdrawn(control)) {
      yield {
        id: control.id.toUpperCase(),
        family,
        name: control.title,
        description: controlDescription(control, params),
      };
    }
    // control enhancements are nested controls
    yield* flattenControls(control.controls, family, params);
  }
}

export function convertOscalCatalog(catalog, mapping_name) {
  if (!catalog?.catalog) {
    throw new Error("Not an OSCAL catalog document (missing 'catalog' root)");
  }
  const { groups = [], controls = [], metadata = {} } = catalog.catalog;
  const params = collectParams([
    ...groups.flatMap((group) => group.controls ?? []),
    ...controls,
  ]);
  const criteria = [
    ...groups.flatMap((group) => [
      ...flattenControls(group.controls, group.title ?? group.id, params),
    ]),
    ...flattenControls(controls, mapping_name, params),
  ];
  return {
    title: metadata.title ?? mapping_name,
    standard: {
      name: mapping_name,
      ...Object.fromEntries(
        criteria.map(({ id, ...criterion }) => [id, criterion])
      ),
    },
  };
}
