import { describe, expect, it } from "vitest";
import { filterQuestions, loadQuestions, validateQuestions } from "../src/questions.js";

describe("canonical question data", () => {
  it("passes structural validation", () => {
    expect(validateQuestions(loadQuestions())).toEqual([]);
  });

  it("contains every ACS Area", () => {
    expect(new Set(loadQuestions().map(({ area }) => area))).toEqual(
      new Set(["I", "II", "III", "IV", "V"]),
    );
  });

  it("filters by area and topic", () => {
    const results = filterQuestions(loadQuestions(), { area: "III", topic: "metar" });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some(({ id }) => id === "WX-001")).toBe(true);
  });

  it("records review state for every generated distractor set", () => {
    const generated = loadQuestions().filter(({ id }) => id.startsWith("CARD-"));
    expect(generated.length).toBe(150);
    expect(generated.every(({ distractorReview }) => typeof distractorReview === "string")).toBe(true);
    expect(generated.every(({ distractorReview }) => distractorReview === "approved")).toBe(true);
  });
});
