#!/usr/bin/env node
import { Command, Option } from "commander";
import { runComplianceAudit, runStats, runStudy, runValidate } from "./commands.js";

const program = new Command();
program
  .name("part107")
  .description("Original ACS-mapped FAA Part 107 study CLI")
  .version("0.1.0");

function addStudyOptions(command: Command, defaultCount: number): Command {
  return command
    .addOption(new Option("-n, --count <number>", "number of questions").default(defaultCount).argParser(Number))
    .option("-a, --area <area>", "ACS Area: I, II, III, IV, or V")
    .option("-t, --topic <text>", "case-insensitive topic filter")
    .option("-s, --seed <seed>", "deterministic question and choice order", "part107")
    .option("--answers <csv>", "non-interactive answers, for example A,C,S,B")
    .option("--history <path>", "history JSON path", ".part107/history.json")
    .option("--remediate", "select only questions most recently answered incorrectly")
    .option("--due", "select questions due under the 1/3/7/14/30-day review schedule")
    .option("--today <YYYY-MM-DD>", "deterministic date for --due")
    .option("--no-save", "do not append this session to history");
}

addStudyOptions(program.command("study").description("run a study session"), 10)
  .action(async (options) => {
    process.exitCode = await runStudy({ ...options, noSave: options.save === false, mode: "study" });
  });

addStudyOptions(program.command("exam").description("run exam mode; explanations appear after scoring"), 60)
  .option("--form <A|B>", "use fixed original 60-question mock form A or B")
  .action(async (options) => {
    process.exitCode = await runStudy({ ...options, noSave: options.save === false, mode: "exam" });
  });

program.command("stats")
  .description("summarize saved attempts and remediation count")
  .option("--history <path>", "history JSON path", ".part107/history.json")
  .option("--today <YYYY-MM-DD>", "deterministic date for due count")
  .action(async ({ history, today }) => {
    const date = today === undefined ? new Date() : new Date(`${today}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) throw new Error("--today must be YYYY-MM-DD");
    process.exitCode = await runStats(history, date);
  });

program.command("validate")
  .description("validate the canonical question dataset")
  .option("--release", "also require generated distractors to be human-approved")
  .action(({ release }) => {
    process.exitCode = runValidate(release === true);
  });

program.command("compliance")
  .description("audit compliance calendar due dates and required ownership")
  .option("--calendar <path>", "compliance calendar CSV", "templates/compliance-calendar.csv")
  .option("--today <YYYY-MM-DD>", "deterministic audit date")
  .option("--json", "emit machine-readable findings")
  .action(async ({ calendar, today, json }) => {
    process.exitCode = await runComplianceAudit(calendar, today, json === true);
  });

program.parseAsync().catch((error: unknown) => {
  process.stderr.write(`Error: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
