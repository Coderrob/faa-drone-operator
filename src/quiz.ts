import { seededRandom, shuffled } from "./random.js";
import type { PresentedQuestion, Question } from "./types.js";

export function selectQuestions(
  questions: readonly Question[],
  count: number,
  seed: string,
): Question[] {
  if (!Number.isInteger(count) || count < 1) throw new Error("count must be a positive integer");
  if (count > questions.length) {
    throw new Error(`requested ${count} questions, but only ${questions.length} match`);
  }
  return shuffled(questions, seededRandom(`${seed}:questions`)).slice(0, count);
}

export function presentQuestion(question: Question, seed: string): PresentedQuestion {
  const indexedChoices = question.choices.map((choice, index) => ({ choice, index }));
  const ordered = shuffled(indexedChoices, seededRandom(`${seed}:${question.id}:choices`));
  return {
    question,
    choices: ordered.map(({ choice }) => choice),
    correctIndex: ordered.findIndex(({ index }) => index === question.correctIndex),
  };
}

export function parseAnswer(value: string, choiceCount = 4): number | null {
  const normalized = value.trim().toUpperCase();
  if (normalized === "S" || normalized === "SKIP") return null;
  const numeric = /^[1-9]$/.test(normalized)
    ? Number(normalized) - 1
    : normalized.length === 1
      ? normalized.charCodeAt(0) - "A".charCodeAt(0)
      : -1;
  return numeric >= 0 && numeric < choiceCount ? numeric : null;
}
