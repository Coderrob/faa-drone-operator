import { describe, expect, it } from "vitest";
import { parseAnswer, presentQuestion, selectQuestions } from "../src/quiz.js";
import { loadQuestions } from "../src/questions.js";

describe("quiz engine", () => {
  it("selects a deterministic subset", () => {
    const questions = loadQuestions();
    expect(selectQuestions(questions, 3, "fixed").map(({ id }) => id)).toEqual(
      selectQuestions(questions, 3, "fixed").map(({ id }) => id),
    );
  });

  it("preserves the correct answer while shuffling choices", () => {
    const question = loadQuestions()[0]!;
    const presented = presentQuestion(question, "fixed");
    expect(presented.choices[presented.correctIndex]).toBe(question.choices[question.correctIndex]);
  });

  it("parses letters, numbers, and skips", () => {
    expect(parseAnswer("A")).toBe(0);
    expect(parseAnswer("4")).toBe(3);
    expect(parseAnswer("skip")).toBeNull();
  });

  it("rejects requests larger than the matching pool", () => {
    expect(() => selectQuestions(loadQuestions(), 1000, "fixed")).toThrow(/only/);
  });
});
