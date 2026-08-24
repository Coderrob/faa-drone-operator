import type { HistoryEntry, SessionState } from "./quiz-session";
import type { Question } from "../../src/types";

/** Tests optional filters.
 * @param question - Candidate question.
 * @param area - Area filter.
 * @param topic - Topic filter.
 * @returns Whether it matches.
 */
export function matchesFilters(question: Question, area: string, topic: string): boolean {
  const areaMatches = [area === "", question.area === area].includes(true);
  const topicMatches = [topic === "", question.topic.toLowerCase().includes(topic)].includes(true);
  return [areaMatches, topicMatches].every(Boolean);
}

/** Creates a fresh session.
 * @param mode - Quiz mode.
 * @param seed - Session seed.
 * @param questions - Selected questions.
 * @param exam - Optional exam metadata.
 * @param exam.form - Exam form.
 * @param exam.expiresAt - Expiration time.
 * @returns Session state.
 */
export function newSession(mode: SessionState["mode"], seed: string, questions: Question[], exam?: { form: string; expiresAt: number }): SessionState {
  const common = {
    version: 1 as const,
    mode,
    seed,
    questionIds: questions.map(({ id }) => id),
    current: 0,
    answers: {},
    flagged: [],
    startedAt: new Date().toISOString(),
  };
  if (!exam) return common;
  return { ...common, ...exam };
}

/** Tests whether an answer is locked.
 * @param mode - Quiz mode.
 * @param answer - Existing answer.
 * @returns Lock state.
 */
export function answerLocked(mode: SessionState["mode"], answer: number | undefined): boolean {
  return [mode === "study", answer !== undefined].every(Boolean);
}

/** Validates an index.
 * @param index - Candidate index.
 * @param length - Collection length.
 * @returns Validity.
 */
export function validIndex(index: number, length: number): boolean {
  return [index >= 0, index < length].every(Boolean);
}

/** Confirms incomplete exams.
 * @param force - Confirmation bypass.
 * @param mode - Quiz mode.
 * @param answered - Answer count.
 * @param total - Total count.
 * @returns Cancellation state.
 */
export function cancelFinish(force: boolean, mode: SessionState["mode"], answered: number, total: number): boolean {
  const needed = [!force, mode === "exam", answered < total].every(Boolean);
  if (!needed) return false;
  return !confirm(`You have ${total - answered} unanswered questions. Finish anyway?`);
}

/** Builds history metadata.
 * @param mode - Quiz mode.
 * @param completed - Completed session.
 * @param correct - Correct count.
 * @param total - Total count.
 * @param percent - Score percentage.
 * @returns History entry.
 */
export function historyEntry(mode: SessionState["mode"], completed: SessionState, correct: number, total: number, percent: number): HistoryEntry {
  const base = { mode, completedAt: new Date().toISOString(), correct, total, percent };
  if (!completed.form) return base;
  return { ...base, form: completed.form };
}

/** Reads a form value.
 * @param values - Submitted form.
 * @param key - Field name.
 * @param fallback - Missing-value fallback.
 * @returns String value.
 */
export function formValue(values: FormData, key: string, fallback: string): string {
  const value = values.get(key);
  return typeof value === "string" ? value : fallback;
}

/** Finds a timer expiration.
 * @param mode - Quiz mode.
 * @param state - Current session.
 * @returns Expiration timestamp.
 */
export function timerExpiry(mode: SessionState["mode"], state: SessionState | undefined): number | undefined {
  if (mode !== "exam") return undefined;
  return state?.expiresAt;
}

/** Gets the current index.
 * @param state - Optional session.
 * @returns Current index or zero.
 */
export function currentIndex(state: SessionState | undefined): number {
  return state?.current ?? 0;
}
