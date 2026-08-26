import path from "path";
import templates from "./templates.mjs";
import GitHubIssuesAdapter from "./GitHubIssuesAdapter.mjs";
import { getCronIterator, mostRecentValidDate } from "./scheduler.mjs";
import { DateTime } from "luxon";
import { promisify } from "util";
import child_process from "child_process";

const execFile_promised = promisify(child_process.execFile);

function log(...message) {
  process.env.RUNNER_DEBUG && console.log(...message);
}

const payloadJson = process.argv[2];
const clientPayload =
  payloadJson && payloadJson !== "null" ? JSON.parse(payloadJson) : {};
const context = templates.mergeContext(clientPayload);

const ticketing = new GitHubIssuesAdapter(context);

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

async function generateScheduledTickets(template) {
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
      template.merge(
        { ...template.dynamic_field_placeholders(), ...clientPayload },
        DateTime.fromJSDate(exec_date)
      )
    );
  }
}

if (clientPayload.procedure) {
  // Manual trigger: only process the specified procedure
  const template = templates.loadTemplate(
    path.join(
      context.config.controls_directory,
      context.config.procedures_subdirectory
    ),
    clientPayload.procedure
  );
  const procedure = template.merge(clientPayload);
  await ticketing.generateTicket(procedure);
} else {
  // Scheduled run: process all templates with a cron schedule.
  // A failure in one procedure must not block the others.
  const failures = [];
  for (const template of templates.loadTemplates(
    context.config.controls_directory,
    context.config.procedures_subdirectory
  )) {
    try {
      await generateScheduledTickets(template);
    } catch (error) {
      console.error(`Failed to process procedure ${template.id}:`, error);
      failures.push(template.id);
    }
  }
  if (failures.length) {
    console.error(`${failures.length} procedure(s) failed:`, failures);
    process.exitCode = 1;
  }
}
