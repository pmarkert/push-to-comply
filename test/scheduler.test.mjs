import { test } from "node:test";
import assert from "node:assert/strict";
import { getCronIterator, mostRecentValidDate } from "../.github/actions/scheduler.mjs";

test("getCronIterator yields each occurrence between start and end", () => {
  const dates = [
    ...getCronIterator(
      "0 0 1 * *",
      new Date("2024-01-15T00:00:00Z"),
      new Date("2024-04-10T00:00:00Z")
    ),
  ];
  assert.equal(dates.length, 3);
  assert.deepEqual(
    dates.map((d) => d.toISOString().slice(0, 10)),
    ["2024-02-01", "2024-03-01", "2024-04-01"]
  );
});

test("getCronIterator yields nothing when start is in the future", () => {
  const dates = [
    ...getCronIterator(
      "0 0 * * *",
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    ),
  ];
  assert.equal(dates.length, 0);
});

test("getCronIterator works with iterator helpers (take)", () => {
  const dates = getCronIterator(
    "0 0 * * *",
    new Date("2024-01-01T00:00:00Z"),
    new Date("2024-02-01T00:00:00Z")
  ).take(3);
  assert.equal([...dates].length, 3);
});

test("mostRecentValidDate ignores invalid dates and picks the latest", () => {
  const result = mostRecentValidDate([
    new Date("2024-01-01"),
    new Date(undefined),
    new Date("invalid"),
    new Date("2024-06-01"),
    "2024-12-31", // not a Date instance
  ]);
  assert.equal(result.toISOString().slice(0, 10), "2024-06-01");
});

test("mostRecentValidDate returns undefined when nothing is valid", () => {
  assert.equal(mostRecentValidDate([new Date(undefined)]), undefined);
});
