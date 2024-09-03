import cronParser from "cron-parser";
import templates from "./templates.mjs";
import GitHubIssuesAdapter from "./GitHubIssuesAdapter.mjs";
import { promisify } from "util";
import child_process from "child_process";

const exec_promised = promisify(child_process.exec);
const exec = (command) =>
  exec_promised(command).then(({ stdout }) => stdout.trim());

const payloadJson = process.argv[2];
const clientPayload =
  payloadJson && payloadJson !== "null" ? JSON.parse(payloadJson) : {};
const context = templates.mergeContext(clientPayload);

function* getCronIterator(cronExpr, start_date, end_date = new Date()) {
  const interval = cronParser.parseExpression(cronExpr, {
    currentDate: start_date,
  });
  let dt = interval.next()._date;
  while (dt < end_date) {
    yield dt;
    dt = interval.next()._date;
  }
}

const ticketing = new GitHubIssuesAdapter(context);

const getFileCommitDate = async (filename) => {
  return exec(
    `git log --diff-filter=A --follow --format=%aI -- ${filename} | tail -1`
  ).then((date) => new Date(date));
};

const mostRecentValidDate = (dates) =>
  dates
    .filter((d) => d instanceof Date && !isNaN(d))
    .sort((a, b) => b - a)?.[0];

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
  // Scheduled run: process all templates with a cron schedule
  for (const template of templates.loadTemplates(
    context.config.controls_directory,
    context.config.procedures_subdirectory
  )) {
    console.log(`Evaluating procedure ${template.id}`);
    // Need dynamic placeholders before rendering in strict-mode
    const procedure = template.merge(template.generate_dynamic_placeholders());
    if (procedure.cron) {
      const period_start_date =
        mostRecentValidDate([
          await ticketing.procedureLastExecuted(procedure), // when the last ticket was created
          await getFileCommitDate(template.filename), // when the procedure was created
          new Date(procedure.start_date), // Start date from metadata
          new Date(context.config.start_of_compliance), // Start date from env or config
        ]) ?? new Date();

      const dates = getCronIterator(procedure.cron, period_start_date).take(
        context.config.ticket_safety_limit
      );
      for (const exec_date of dates) {
        await ticketing.generateTicket(
          template.merge(clientPayload, exec_date)
        );
      }
    }
  }
}
