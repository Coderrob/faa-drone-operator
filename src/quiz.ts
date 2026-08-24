import { seededRandom, shuffled } from "./random.js";
import type { PresentedQuestion, Question } from "./types.js";

/**
 * Selects a deterministic subset of questions.
 * @param questions - Candidate question pool.
 * @param count - Number of questions to select.
 * @param seed - Seed controlling selection order.
 * @returns The selected questions.
 * @throws {Error} When count is invalid or exceeds the pool size.
 */
export function selectQuestions(questions: readonly Question[], count: number, seed: string): Question[] {
  validateCount(count);
  if (count > questions.length) {
    throw new Error(`requested ${count} questions, but only ${questions.length} match`);
  }
  return shuffled(questions, seededRandom(`${seed}:questions`)).slice(0, count);
}

/**
 * Validates a requested question count.
 * @param count - Requested count.
 * @returns Nothing.
 * @throws {Error} When invalid.
 */
function validateCount(count: number): void {
  if (!Number.isInteger(count) || count < 1) throw new Error("count must be a positive integer");
}

/**
 * Shuffles a question's choices while retaining its correct-answer mapping.
 * @param question - Question to prepare for display.
 * @param seed - Seed controlling choice order.
 * @returns The display-ready question.
 */
export function presentQuestion(question: Question, seed: string): PresentedQuestion {
  const indexedChoices = question.choices.map((choice, index) => ({ choice, index }));
  const ordered = shuffled(indexedChoices, seededRandom(`${seed}:${question.id}:choices`));
  return {
    question,
    choices: ordered.map(({ choice }) => choice),
    correctIndex: ordered.findIndex(({ index }) => index === question.correctIndex),
  };
}

/**
 * Converts a letter, number, or skip response to a choice index.
 * @param value - Raw user response.
 * @param choiceCount - Number of available choices.
 * @returns A zero-based choice index, or null for invalid and skipped input.
 */
export function parseAnswer(value: string, choiceCount = 4): number | null {
  const normalized = value.trim().toUpperCase();
  if (["S", "SKIP"].includes(normalized)) return null;
  return boundedIndex(answerIndex(normalized), choiceCount);
}

/**
 * Converts a normalized answer token to an unbounded index.
 * @param value - Normalized answer token.
 * @returns The candidate index, or negative one for an unsupported token.
 */
function answerIndex(value: string): number {
  if (/^[1-9]$/.test(value)) return Number(value) - 1;
  if (value.length !== 1) return -1;
  return value.charCodeAt(0) - "A".charCodeAt(0);
}

/**
 * Validates an answer index against the available choices.
 * @param index - Candidate zero-based index.
 * @param choiceCount - Number of available choices.
 * @returns The index when valid, otherwise null.
 */
function boundedIndex(index: number, choiceCount: number): number | null {
  return index < 0 || index >= choiceCount ? null : index;
}
