import { describe, expect, it } from "vitest";
import { parseAnswer, presentQuestion, selectQuestions } from "./quiz.js";
import { loadQuestions } from "./questions.js";

describe("quiz engine", () => {
  it("should select a deterministic subset", () => {
    const questions = loadQuestions();
    expect(selectQuestions(questions, 3, "fixed").map(({ id }) => id)).toEqual(
      selectQuestions(questions, 3, "fixed").map(({ id }) => id),
    );
  });

  it("should preserve the correct answer while shuffling choices", () => {
    const question = loadQuestions()[0]!;
    const presented = presentQuestion(question, "fixed");
    expect(presented.choices[presented.correctIndex]).toBe(question.choices[question.correctIndex]);
  });

  it("should parse letters, numbers, and skips", () => {
    expect(parseAnswer("A")).toBe(0);
    expect(parseAnswer("4")).toBe(3);
    expect(parseAnswer("skip")).toBeNull();
  });
});

describe("quiz engine validation", () => {
  it("should reject requests larger than the matching pool", () => {
    expect(() => selectQuestions(loadQuestions(), 1000, "fixed")).toThrow(/only/);
    expect(() => selectQuestions(loadQuestions(), 0, "fixed")).toThrow(/positive/);
  });

  it("should return null for out-of-range and malformed answers", () => {
    expect(parseAnswer("E")).toBeNull();
    expect(parseAnswer("words")).toBeNull();
    expect(parseAnswer("1", 0)).toBeNull();
  });
});
