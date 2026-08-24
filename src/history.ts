import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { HistoryFile, SessionRecord } from "./types.js";

const EMPTY_HISTORY: HistoryFile = { version: 1, sessions: [] };
interface ReviewState { streak: number; reviewedAt: number }
const CORRECT_INTERVALS = [3, 7, 14, 30] as const;

/**
 * Calculates the next review interval for an answer streak.
 * @param streak - Number of consecutive correct answers.
 * @returns Days until the next review.
 */
function reviewInterval(streak: number): number {
  if (streak === 0) return 1;
  return CORRECT_INTERVALS[Math.min(streak, CORRECT_INTERVALS.length) - 1]!;
}

/**
 * Records valid answers from one session in review state.
 * @param state - Mutable per-question review state.
 * @param session - Session whose answers should be recorded.
 * @returns Nothing.
 */
function recordSession(state: Map<string, ReviewState>, session: SessionRecord): void {
  const reviewedAt = Date.parse(session.completedAt);
  if (!Number.isFinite(reviewedAt)) return;
  for (const answer of session.answers) {
    recordAnswer(state, answer.questionId, answer.correct, reviewedAt);
  }
}

/**
 * Updates one question's review state from an answer.
 * @param state - Mutable per-question review state.
 * @param questionId - Answered question identifier.
 * @param correct - Whether the answer was correct.
 * @param reviewedAt - Session completion time.
 * @returns Nothing.
 */
function recordAnswer(state: Map<string, ReviewState>, questionId: string, correct: boolean, reviewedAt: number): void {
  const previous = state.get(questionId);
  const streak = nextStreak(previous, correct);
  state.set(questionId, { streak, reviewedAt });
}

/**
 * Calculates the next answer streak.
 * @param previous - Previous state.
 * @param correct - Answer outcome.
 * @returns Updated streak.
 */
function nextStreak(previous: ReviewState | undefined, correct: boolean): number {
  if (!correct) return 0;
  return previous === undefined ? 1 : previous.streak + 1;
}

/**
 * Reads and validates a persisted study history.
 * @param path - JSON history file path.
 * @returns The saved history, or an empty history when the file is absent.
 * @throws {Error} When the file cannot be read or has an unsupported format.
 */
export async function readHistory(path: string): Promise<HistoryFile> {
  try {
    return parseHistory(await readFile(path, "utf8"));
  } catch (error) {
    if (isMissingFile(error)) return EMPTY_HISTORY;
    throw error;
  }
}

/**
 * Parses and validates persisted history JSON.
 * @param content - JSON source text.
 * @returns Validated study history.
 * @throws {Error} When the history format is unsupported.
 */
function parseHistory(content: string): HistoryFile {
  const parsed = JSON.parse(content) as HistoryFile;
  if (parsed.version !== 1) throw new Error("unsupported history format");
  if (!Array.isArray(parsed.sessions)) throw new Error("unsupported history format");
  return parsed;
}

/**
 * Determines whether an unknown error represents an absent file.
 * @param error - Caught file-system error.
 * @returns Whether the error code is ENOENT.
 */
function isMissingFile(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === "ENOENT";
}

/**
 * Appends a completed session to a history file.
 * @param path - JSON history file path.
 * @param session - Session to persist.
 * @returns A promise fulfilled after the file is written.
 * @throws {Error} When the history cannot be read or written.
 */
export async function appendSession(path: string, session: SessionRecord): Promise<void> {
  const history = await readHistory(path);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify({ version: 1, sessions: [...history.sessions, session] }, null, 2)}\n`, "utf8");
}

/**
 * Finds questions whose most recent answer was incorrect.
 * @param history - Study history to inspect.
 * @returns Question identifiers requiring remediation.
 */
export function remediationIds(history: HistoryFile): Set<string> {
  const latest = new Map<string, boolean>();
  for (const session of history.sessions) {
    for (const answer of session.answers) latest.set(answer.questionId, answer.correct);
  }
  return new Set([...latest].filter(([, correct]) => !correct).map(([id]) => id));
}

/**
 * Finds questions due under the 1/3/7/14/30-day review schedule.
 * @param history - Study history to inspect.
 * @param now - Date against which due times are compared.
 * @returns Question identifiers due for review.
 */
export function dueQuestionIds(history: HistoryFile, now: Date): Set<string> {
  const state = new Map<string, ReviewState>();
  for (const session of history.sessions) recordSession(state, session);
  return new Set([...state].filter(([, record]) => isDue(record, now.getTime())).map(([questionId]) => questionId));
}

/**
 * Determines whether a review record has reached its next interval.
 * @param record - Latest question review state.
 * @param now - Comparison time as epoch milliseconds.
 * @returns Whether the question is due.
 */
function isDue(record: ReviewState, now: number): boolean {
  const dueAt = record.reviewedAt + reviewInterval(record.streak) * 86_400_000;
  return now >= dueAt;
}
