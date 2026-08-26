// Evaluates procedure schedules and generates tickets via the ticketing
// adapter. A manual trigger (clientPayload.procedure) processes only that
// procedure; a scheduled run processes every procedure with a cron property.

import path from "path";
import { promisify } from "util";
import child_process from "child_process";
import { DateTime } from "luxon";
import templates from "./templates.mjs";
import GitHubIssuesAdapter from "./GitHubIssuesAdapter.mjs";
import { getCronIterator, mostRecentValidDate } from "./scheduler.mjs";

const execFile_promised = promisify(child_process.execFile);

export const AUTOMATION_LABEL = "automation:agent";
export const AUTOMATION_MODES = ["assist", "execute"];

// Procedures may declare an `automation` block in front-matter:
//
//   automation:
//     mode: assist            # gather/draft evidence only (default)
//     # mode: execute         # actually perform the listed actions
//     instructions: |
//       ...prompt for the agent...
//     evidence:
//       - what the agent should attach
//
// Tickets for such procedures get an "Agent Instructions" section with a
// machine-readable marker and the automation label, so any runner (the
// Claude GitHub app, a claude-code-action workflow, or an org's own bot)
// can pick them up. The agent NEVER closes the ticket: a human reviews the
// posted evidence and closes it, so closure remains the sign-off.
export function applyAutomation(procedure) {
  const automation = procedure.automation;
  if (!automation) {
    return procedure;
  }
  const mode = automation.mode ?? "assist";
  if (!AUTOMATION_MODES.includes(mode)) {
    throw new Error(
      `${procedure.id}: automation.mode must be one of ${AUTOMATION_MODES.join(", ")} (got "${mode}")`
    );
  }
  const section = [
    "",
    "---",
    "",
    `<!-- ptcomply:automation mode="${mode}" procedure="${procedure.id}" -->`,
    "## Agent Instructions",
    "",
    mode === "assist"
      ? "_Automation mode: **assist** — gather information and draft evidence only; take no actions that change systems._"
      : "_Automation mode: **execute** — perform the actions below._",
    "",
    "An agent may perform this work and post its findings and evidence as" +
      " comments. The agent must **never close this ticket** — a human" +
      " assignee reviews the evidence and closes it as sign-off.",
    "",
    automation.instructions ?? "",
    ...(automation.evidence?.length
      ? [
          "### Expected evidence",
          "",
          ...automation.evidence.map((item) => `- ${item}`),
        ]
      : []),
  ].join("\n");
  return {
    ...procedure,
    body: `${procedure.body}\n${section}`,
    github: {
      ...procedure.github,
      labels: [procedure.github?.labels ?? [], AUTOMATION_LABEL].flat(),
    },
  };
}

function log(...message) {
  process.env.RUNNER_DEBUG && console.log(...message);
}

const getFileCommitDate = async (filename) => {
  const { stdout } = await execFile_promised("git", [
    "log",
    "--diff-filter=A",
    "--follow",
    "--format=%aI",
    "--",
    filename,
  ]);
  return new Date(stdout.trim().split("\n").pop());
};

async function generateScheduledTickets(ticketing, context, template, clientPayload) {
  log(`Evaluating procedure ${template.id}`);
  // Need dynamic placeholders before rendering in strict-mode
  const procedure = template.merge(template.generate_dynamic_placeholders());
  if (!procedure.cron) {
    return;
  }
  const period_start_date =
    mostRecentValidDate([
      await ticketing.procedureLastExecuted(procedure), // when the last ticket was created
      await getFileCommitDate(template.filename), // when the procedure was created
      new Date(procedure.start_date), // Start date from metadata
      new Date(context.config.start_of_compliance), // Start date from env or config
    ]) ?? new Date();
  log(`Starting from ${period_start_date.toISOString()}`);

  const dates = getCronIterator(procedure.cron, period_start_date).take(
    context.config.ticket_safety_limit
  );
  for (const exec_date of dates) {
    // Scheduled runs render dynamic fields as visible placeholders, but real
    // date-context values, for the moment at which the ticket was due.
    await ticketing.generateTicket(
      applyAutomation(
        template.merge(
          { ...template.dynamic_field_placeholders(), ...clientPayload },
          DateTime.fromJSDate(exec_date)
        )
      )
    );
  }
}

// Returns the ids of procedures that failed (empty array on success).
export async function runProcedures(clientPayload = {}) {
  const context = templates.mergeContext(clientPayload);
  const ticketing = new GitHubIssuesAdapter(context);

  if (clientPayload.procedure) {
    // Manual trigger: only process the specified procedure
    const template = templates.loadTemplate(
      path.join(
        context.config.controls_directory,
        context.config.procedures_subdirectory
      ),
      clientPayload.procedure
    );
    await ticketing.generateTicket(applyAutomation(template.merge(clientPayload)));
    return [];
  }

  // Scheduled run: process all templates with a cron schedule.
  // A failure in one procedure must not block the others.
  const failures = [];
  for (const template of templates.loadTemplates(
    context.config.controls_directory,
    context.config.procedures_subdirectory
  )) {
    try {
      await generateScheduledTickets(ticketing, context, template, clientPayload);
    } catch (error) {
      console.error(`Failed to process procedure ${template.id}:`, error);
      failures.push(template.id);
    }
  }
  return failures;
}
