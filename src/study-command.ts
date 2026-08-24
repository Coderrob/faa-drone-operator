import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { appendSession, dueQuestionIds, readHistory, remediationIds } from "./history.js";
import { selectMockForm } from "./mock-exams.js";
import { filterQuestions, loadQuestions } from "./questions.js";
import { parseAnswer, presentQuestion, selectQuestions } from "./quiz.js";
import type { AcsArea, AnswerResult, Question, SessionRecord } from "./types.js";
import type { Interface } from "node:readline/promises";

export interface StudyOptions {
  readonly count: number;
  readonly area?: string;
  readonly topic?: string;
  readonly seed: string;
  readonly answers?: string;
  readonly history: string;
  readonly remediate?: boolean;
  readonly due?: boolean;
  readonly today?: string;
  readonly noSave?: boolean;
  readonly mode?: "study" | "exam";
  readonly form?: string;
}

type History = Awaited<ReturnType<typeof readHistory>>;

/**
 * Runs an interactive or supplied-answer study session.
 * @param options - Study selection, input, and persistence options.
 * @returns Zero for passing and two for a score below 70 percent.
 * @throws {Error} When options conflict or no questions match.
 */
export async function runStudy(options: StudyOptions): Promise<number> {
  validateStudyOptions(options);
  const history = await readHistory(options.history);
  const pool = studyPool(options, history, parseReviewDate(options.today));
  if (pool.length === 0) throw new Error("no questions match the requested filters");
  const questions = selectStudyQuestions(options, pool);
  const startedAt = new Date().toISOString();
  const answers = await collectAnswers(questions, options);
  const percent = printScore(questions, answers, options.mode);
  await saveStudySession(options, startedAt, answers);
  return percent >= 70 ? 0 : 2;
}

/**
 * Validates compatible study options.
 * @param options - Study options to validate.
 * @returns Nothing.
 * @throws {Error} When options conflict.
 */
function validateStudyOptions(options: StudyOptions): void {
  rejectFormConflict(options);
  rejectReviewConflict(options);
}

/**
 * Rejects a named form combined with question filters.
 * @param options - Study options to validate.
 * @returns Nothing.
 * @throws {Error} When a form and filter are combined.
 */
function rejectFormConflict(options: StudyOptions): void {
  const filtered = [options.area, options.topic, options.remediate, options.due].some(Boolean);
  if (options.form !== undefined && filtered) throw new Error("--form cannot be combined with --area, --topic, --remediate, or --due");
}

/**
 * Rejects simultaneous remediation and due review modes.
 * @param options - Study options to validate.
 * @returns Nothing.
 * @throws {Error} When both review modes are selected.
 */
function rejectReviewConflict(options: StudyOptions): void {
  if (options.remediate === true && options.due === true) throw new Error("choose either --remediate or --due");
}

/**
 * Parses a review date.
 * @param today - Optional ISO date.
 * @returns The parsed review date.
 * @throws {Error} When the input is invalid.
 */
function parseReviewDate(today?: string): Date {
  const date = today === undefined ? new Date() : new Date(`${today}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error("--today must be YYYY-MM-DD");
  return date;
}

/**
 * Builds the filtered study pool.
 * @param options - Study selection options.
 * @param history - Saved study history.
 * @param date - Review date.
 * @returns Questions matching all filters.
 */
function studyPool(options: StudyOptions, history: History, date: Date): Question[] {
  const dueIds = reviewIds(options, history, date);
  return filterQuestions(loadQuestions(), { area: normalizedArea(options.area), topic: options.topic, dueIds });
}

/**
 * Selects review identifiers for the requested mode.
 * @param options - Study options.
 * @param history - Saved study history.
 * @param date - Review date.
 * @returns Review identifiers, or undefined without a review filter.
 */
function reviewIds(options: StudyOptions, history: History, date: Date): Set<string> | undefined {
  if (options.remediate === true) return remediationIds(history);
  return options.due === true ? dueQuestionIds(history, date) : undefined;
}

/**
 * Normalizes and validates an optional ACS area.
 * @param value - User-supplied area value.
 * @returns The normalized area, or undefined when omitted.
 * @throws {Error} When the value is not an ACS area.
 */
function normalizedArea(value?: string): AcsArea | undefined {
  if (value === undefined) return undefined;
  const normalized = value.toUpperCase();
  if (!["I", "II", "III", "IV", "V"].includes(normalized)) throw new Error("area must be I, II, III, IV, or V");
  return normalized as AcsArea;
}

/**
 * Selects a random set or named exam form.
 * @param options - Study options.
 * @param pool - Filtered question pool.
 * @returns Selected questions.
 */
function selectStudyQuestions(options: StudyOptions, pool: readonly Question[]): Question[] {
  return options.form === undefined ? selectQuestions(pool, options.count, options.seed) : selectMockForm(options.form, loadQuestions());
}

/**
 * Collects answers and closes the interactive reader.
 * @param questions - Selected questions.
 * @param options - Study options.
 * @returns Answer results.
 */
async function collectAnswers(questions: readonly Question[], options: StudyOptions): Promise<AnswerResult[]> {
  const supplied = suppliedAnswers(options.answers);
  const reader = answerReader(options.answers);
  try {
    return await askAllQuestions(questions, options, supplied, reader);
  } finally {
    reader?.close();
  }
}

/**
 * Parses comma-separated supplied answers.
 * @param answers - Optional comma-separated answer text.
 * @returns Individual answer tokens.
 */
function suppliedAnswers(answers?: string): string[] {
  return answers === undefined ? [] : answers.split(",");
}

/**
 * Creates a reader for interactive sessions.
 * @param answers - Optional supplied answers.
 * @returns An interactive reader when answers were not supplied.
 */
function answerReader(answers?: string): Interface | undefined {
  return answers === undefined ? createInterface({ input, output }) : undefined;
}

/**
 * Asks every selected question.
 * @param questions - Selected questions.
 * @param options - Study options.
 * @param supplied - Supplied answer tokens.
 * @param reader - Optional interactive reader.
 * @returns Answer results.
 */
async function askAllQuestions(questions: readonly Question[], options: StudyOptions, supplied: readonly string[], reader?: Interface): Promise<AnswerResult[]> {
  const answers: AnswerResult[] = [];
  for (const [index, question] of questions.entries()) {
    answers.push(await askQuestion(question, index, questions.length, options, supplied[index], reader));
  }
  return answers;
}

/**
 * Presents and scores one question.
 * @param question - Question to present.
 * @param index - Zero-based question position.
 * @param total - Total question count.
 * @param options - Study options.
 * @param supplied - Optional supplied answer.
 * @param reader - Optional interactive reader.
 * @returns The scored answer.
 */
async function askQuestion(question: Question, index: number, total: number, options: StudyOptions, supplied?: string, reader?: Interface): Promise<AnswerResult> {
  const presented = presentQuestion(question, options.seed);
  output.write(`\n${index + 1}/${total} [${question.acsCode}] ${question.prompt}\n`);
  presented.choices.forEach((choice, choiceIndex) => output.write(`  ${String.fromCharCode(65 + choiceIndex)}. ${choice}\n`));
  const selectedIndex = parseAnswer(await readAnswer(reader, supplied), presented.choices.length);
  const correct = selectedIndex === presented.correctIndex;
  if (options.mode !== "exam") printExplanation(question, correct);
  return { questionId: question.id, acsCode: question.acsCode, selectedIndex, correct };
}

/**
 * Reads one supplied or interactive answer.
 * @param reader - Optional interactive reader.
 * @param supplied - Optional supplied answer token.
 * @returns The raw answer.
 */
async function readAnswer(reader: Interface | undefined, supplied?: string): Promise<string> {
  return reader === undefined ? supplied ?? "S" : reader.question("Answer (A-D or S to skip): ");
}

/**
 * Writes remediation and source details.
 * @param question - Answered question.
 * @param correct - Whether the answer was correct.
 * @returns Nothing.
 */
function printExplanation(question: Question, correct: boolean): void {
  output.write(`${correct ? "Correct" : "Incorrect"}: ${question.explanation}\n`);
  output.write(`Remediation: ${question.remediation}\n`);
  for (const citation of question.citations) output.write(`Source: ${citation.label}, ${citation.locator} — ${citation.url}\n`);
}

/**
 * Prints the score and delayed exam explanations.
 * @param questions - Selected questions.
 * @param answers - Scored answers.
 * @param mode - Session mode.
 * @returns Percentage score.
 */
function printScore(questions: readonly Question[], answers: readonly AnswerResult[], mode?: "study" | "exam"): number {
  const correctCount = answers.filter(({ correct }) => correct).length;
  const percent = Math.round((correctCount / answers.length) * 100);
  output.write(`\nScore: ${correctCount}/${answers.length} (${percent}%)\n`);
  if (mode === "exam") questions.forEach((question, index) => { printExplanation(question, answers[index]!.correct); });
  return percent;
}

/**
 * Saves a completed session when enabled.
 * @param options - Study options.
 * @param startedAt - Session start timestamp.
 * @param answers - Scored answers.
 * @returns A completion promise.
 * @throws {Error} When history cannot be written.
 */
async function saveStudySession(options: StudyOptions, startedAt: string, answers: readonly AnswerResult[]): Promise<void> {
  if (options.noSave === true) return;
  const session: SessionRecord = {
    id: `${startedAt}-${options.seed}`, mode: options.mode ?? "study", startedAt,
    completedAt: new Date().toISOString(), seed: options.seed, answers,
  };
  await appendSession(options.history, session);
}
