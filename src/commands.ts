import { stdout as output } from "node:process";
import { auditComplianceFile } from "./compliance.js";
import { dueQuestionIds, readHistory, remediationIds } from "./history.js";
import { loadQuestions, validateQuestions } from "./questions.js";
import type { Question } from "./types.js";

export { runStudy } from "./study-command.js";
export type { StudyOptions } from "./study-command.js";

/**
 * Validates the canonical question collection.
 * @param release - Whether to enforce distractor release approval.
 * @returns Zero for valid data or one when validation fails.
 */
export function runValidate(release = false): number {
  const questions = loadQuestions();
  const errors = validationErrors(questions, release);
  return errors.length === 0 ? printValidationSuccess(questions, release) : printValidationErrors(errors);
}

/**
 * Combines schema and optional release validation errors.
 * @param questions - Questions to validate.
 * @param release - Whether release approval is required.
 * @returns All applicable validation errors.
 */
function validationErrors(questions: readonly Question[], release: boolean): string[] {
  const errors = validateQuestions(questions);
  return release ? [...errors, ...releaseErrors(questions)] : errors;
}

/**
 * Prints a successful validation summary.
 * @param questions - Validated questions.
 * @param release - Whether release approval was validated.
 * @returns A successful process exit code.
 */
function printValidationSuccess(questions: readonly Question[], release: boolean): number {
  const areaCount = new Set(questions.map(({ area }) => area)).size;
  const releaseText = release ? " and approved for release" : "";
  output.write(`PASS: ${questions.length} questions valid across ${areaCount} ACS Areas${releaseText}.\n`);
  return 0;
}

/**
 * Prints validation errors.
 * @param errors - Validation errors to print.
 * @returns A failure process exit code.
 */
function printValidationErrors(errors: readonly string[]): number {
  errors.forEach((error) => output.write(`ERROR: ${error}\n`));
  return 1;
}

/**
 * Finds missing release approvals.
 * @param questions - Questions to inspect.
 * @returns Release-approval errors.
 */
function releaseErrors(questions: readonly Question[]): string[] {
  return questions
    .filter((question) => question.id.startsWith("CARD-") && question.distractorReview !== "approved")
    .map((question) => `${question.id}: distractors are not approved for release`);
}

/**
 * Prints aggregate performance and review statistics.
 * @param historyPath - JSON history file path.
 * @param today - Date used for spaced-review calculations.
 * @returns A successful process exit code.
 * @throws {Error} When history cannot be read.
 */
export async function runStats(historyPath: string, today = new Date()): Promise<number> {
  const history = await readHistory(historyPath);
  const answers = history.sessions.flatMap(({ answers: sessionAnswers }) => sessionAnswers);
  const correct = answers.filter((answer) => answer.correct).length;
  const percent = answers.length === 0 ? 0 : Math.round((correct / answers.length) * 100);
  output.write(`Sessions: ${history.sessions.length}\nAnswers: ${answers.length}\n`);
  output.write(`Correct: ${percent}%\n`);
  output.write(`Due for remediation: ${remediationIds(history).size}\n`);
  output.write(`Due for spaced review: ${dueQuestionIds(history, today).size}\n`);
  return 0;
}

/**
 * Audits and prints compliance-calendar findings.
 * @param path - Compliance calendar CSV path.
 * @param todayText - Optional ISO audit date.
 * @param json - Whether to emit JSON instead of human-readable text.
 * @returns Zero when current, or three when overdue or incomplete.
 * @throws {Error} When the date or calendar is invalid.
 */
export async function runComplianceAudit(path: string, todayText?: string, json = false): Promise<number> {
  const findings = await auditComplianceFile(path, parseReviewDate(todayText));
  printAudit(findings, json);
  return auditExitCode(findings);
}

/**
 * Parses an optional review date.
 * @param today - Optional ISO date.
 * @returns The parsed date.
 * @throws {Error} When the date is invalid.
 */
function parseReviewDate(today?: string): Date {
  const date = today === undefined ? new Date() : new Date(`${today}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error("--today must be YYYY-MM-DD");
  return date;
}

type AuditFindings = Awaited<ReturnType<typeof auditComplianceFile>>;

/**
 * Prints an audit in the requested format.
 * @param findings - Findings to print.
 * @param json - Whether to print JSON.
 * @returns Nothing.
 */
function printAudit(findings: AuditFindings, json: boolean): void {
  if (json) output.write(`${JSON.stringify(findings, null, 2)}\n`);
  else printComplianceFindings(findings);
}

/**
 * Calculates an audit exit code.
 * @param findings - Findings to evaluate.
 * @returns Three for overdue or missing items, otherwise zero.
 */
function auditExitCode(findings: AuditFindings): number {
  return findings.some(({ state }) => ["overdue", "missing"].includes(state)) ? 3 : 0;
}

/**
 * Prints human-readable compliance findings.
 * @param findings - Audit findings to print.
 * @returns Nothing.
 */
function printComplianceFindings(findings: AuditFindings): void {
  const counts = new Map<string, number>();
  for (const finding of findings) {
    printComplianceFinding(finding);
    counts.set(finding.state, (counts.get(finding.state) ?? 0) + 1);
  }
  const summary = [...counts].map(([state, count]) => `${state}=${count}`).join(" ");
  output.write(`Summary: ${summary}\n`);
}

/**
 * Prints one compliance finding.
 * @param finding - Finding to print.
 * @returns Nothing.
 */
function printComplianceFinding(finding: AuditFindings[number]): void {
  const remaining = finding.daysRemaining === null ? "n/a" : `${finding.daysRemaining}d`;
  const owner = finding.responsiblePerson === "" ? "MISSING" : finding.responsiblePerson;
  output.write(`${finding.state.padEnd(9)} ${remaining.padStart(6)}  ${finding.item}  owner=${owner}\n`);
}
