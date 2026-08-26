---
name: map-controls
description: Analyze or improve the mapping between this program's controls and framework criteria - find gaps, fix satisfies mappings, or plan coverage for a new standard. Use for questions like "where are our gaps", "what satisfies CC6.1", or after adding a standard.
---

Work with the control ↔ criteria mappings.

1. **Ground truth:** `npx ptcomply gaps --json` (or
   `public/compliance.json` after `npx ptcomply build`) gives every
   standard, per-criterion coverage with contributing control ids, and the
   `unsatisfied` list. Never infer coverage by reading documents alone.
2. **Answering "what covers X":** find the criterion in the JSON; cite the
   contributing controls with links (`<control-id>.html` pages or repo
   paths).
3. **Closing gaps** — for each unsatisfied criterion, decide with the
   user:
   - An existing document already does this work → add the criterion to
     its `satisfies` (only if genuinely true).
   - Practice exists but is undocumented → write the document
     (see the add-policy skill).
   - No practice exists → that's a real gap; record it (an observation in
     the evidence repo, or a tracked issue) rather than papering over it
     with words.
4. **New standards:** drop an OSCAL JSON catalog (e.g. NIST 800-53 from
   usnistgov/oscal-content) or an opencontrol-style file into
   `standards/`; the filename (minus extension) is the mapping key. Then
   work the gap list top-down, reusing existing controls first.
5. Verify with `npx ptcomply validate` (catches typo'd criterion ids) and
   re-run `gaps` to show the delta. Mapping changes go through PR review
   like any control change.
