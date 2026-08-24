import type { PresentedQuestion, Question } from "../../src/types";

export interface MockForm {
  id: string;
  title: string;
  timeLimitMinutes: number;
  passingPercent: number;
  questionIds: string[];
}

export interface QuizPayload { questions: Question[]; forms: MockForm[]; }
export interface SessionState {
  version: 1;
  mode: "study" | "exam";
  seed: string;
  form?: string;
  questionIds: string[];
  current: number;
  answers: Record<string, number>;
  flagged: string[];
  startedAt: string;
  expiresAt?: number;
}
export interface HistoryEntry { mode: string; form?: string; completedAt: string; correct: number; total: number; percent: number; }

/**
 * Parses a saved session and rejects stale or incompatible data.
 * @param serialized - JSON read from browser storage.
 * @param mode - Quiz mode required by the current page.
 * @param questionIds - IDs available in the current question payload.
 * @returns The validated session, or undefined when validation fails.
 */
export function parseSession(serialized: string | null, mode: SessionState["mode"], questionIds: ReadonlySet<string>): SessionState | undefined {
  const value = parseJson<SessionState | null>(serialized, null);
  if (!isCompatibleSession(value, mode, questionIds)) return undefined;
  return value;
}

/**
 * Determines whether stored session data can be resumed safely.
 * @param value - Candidate session value.
 * @param mode - Quiz mode required by the current page.
 * @param questionIds - IDs available in the current question payload.
 * @returns True when the session is compatible.
 */
export function isCompatibleSession(value: SessionState | null, mode: SessionState["mode"], questionIds: ReadonlySet<string>): value is SessionState {
  if (!hasCompatibleHeader(value, mode)) return false;
  return hasKnownQuestions(value.questionIds, questionIds);
}

/**
 * Checks stored session version and mode metadata.
 * @param value - Candidate session value.
 * @param mode - Required page mode.
 * @returns True when session metadata is compatible.
 */
function hasCompatibleHeader(value: SessionState | null, mode: SessionState["mode"]): value is SessionState {
  if (value?.version !== 1) return false;
  return value.mode === mode;
}

/**
 * Parses quiz history without allowing malformed storage to break the page.
 * @param serialized - JSON read from browser storage.
 * @returns Parsed history, or an empty collection for invalid data.
 */
export function parseHistory(serialized: string | null): HistoryEntry[] {
  const value = parseJson<unknown>(serialized, []);
  if (!Array.isArray(value)) return [];
  return value as HistoryEntry[];
}

/**
 * Parses JSON with a typed fallback.
 * @param serialized - Serialized JSON or null.
 * @param fallback - Value returned after a parse failure.
 * @returns Parsed JSON or the supplied fallback.
 */
function parseJson<T>(serialized: string | null, fallback: T): T {
  try {
    return JSON.parse(serialized ?? JSON.stringify(fallback)) as T;
  } catch {
    return fallback;
  }
}

/**
 * Checks whether every saved question still exists.
 * @param savedIds - Saved question identifiers.
 * @param availableIds - Currently available identifiers.
 * @returns True when all saved identifiers are available.
 */
function hasKnownQuestions(savedIds: string[], availableIds: ReadonlySet<string>): boolean {
  for (const id of savedIds) {
    if (!availableIds.has(id)) return false;
  }
  return true;
}

/**
 * Calculates the number of correctly answered questions.
 * @param questions - Questions as presented to the learner.
 * @param answers - Selected choice indexes keyed by question ID.
 * @returns Count of correct answers.
 */
export function correctAnswerCount(questions: PresentedQuestion[], answers: Record<string, number>): number {
  return questions.filter((item) => answers[item.question.id] === item.correctIndex).length;
}

/**
 * Converts a score into a whole-number percentage.
 * @param correct - Correct-answer count.
 * @param total - Total question count.
 * @returns Rounded score percentage, or zero for an empty quiz.
 */
export function scorePercent(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

/**
 * Formats a remaining duration for the exam timer.
 * @param milliseconds - Remaining time in milliseconds.
 * @returns A zero-padded HH:MM:SS value.
 */
export function formatRemaining(milliseconds: number): string {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  const parts = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60];
  return parts.map((value) => String(value).padStart(2, "0")).join(":");
}

/**
 * Toggles an identifier in an immutable flag list.
 * @param flagged - Current flagged question IDs.
 * @param id - Question ID to toggle.
 * @returns A new list containing the toggled state.
 */
export function toggleQuestionFlag(flagged: string[], id: string): string[] {
  return flagged.includes(id) ? flagged.filter((value) => value !== id) : [...flagged, id];
}
