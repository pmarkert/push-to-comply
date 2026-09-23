import cronParser from "cron-parser";

// Yields each scheduled occurrence between start_date (exclusive) and
// end_date (exclusive). Uses only the public cron-parser API.
export function* getCronIterator(cronExpr, start_date, end_date = new Date()) {
  const interval = cronParser.parseExpression(cronExpr, {
    currentDate: start_date,
  });
  let dt = interval.next().toDate();
  while (dt < end_date) {
    yield dt;
    dt = interval.next().toDate();
  }
}

export const mostRecentValidDate = (dates) =>
  dates.filter((d) => d instanceof Date && !isNaN(d)).sort((a, b) => b - a)[0];
