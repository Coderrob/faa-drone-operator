import { describe, expect, it } from "vitest";
import { filterQuestions, loadQuestions, validateQuestions } from "./questions.js";
import type { Question } from "./types.js";

const validQuestion = loadQuestions()[0]!;

// eslint-disable-next-line max-lines-per-function -- Root suite groups function-level describes.
describe("questions", () => {
  describe("loadQuestions and filterQuestions", () => {
    it("should pass structural validation", () => {
      expect(validateQuestions(loadQuestions())).toEqual([]);
    });

    it("should contain every ACS Area", () => {
      expect(new Set(loadQuestions().map(({ area }) => area))).toEqual(new Set(["I", "II", "III", "IV", "V"]));
    });

    it("should filter by area and topic", () => {
      const results = filterQuestions(loadQuestions(), { area: "III", topic: "metar" });
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some(({ id }) => id === "WX-001")).toBe(true);
    });
  });

  describe("canonical question validation", () => {
    it("should support each filter independently and reject nonmatches", () => {
      const questions = loadQuestions();
      expect(filterQuestions(questions, { area: "I" }).every(({ area }) => area === "I")).toBe(true);
      expect(filterQuestions(questions, { topic: "  METAR  " }).some(({ id }) => id === "WX-001")).toBe(true);
      expect(filterQuestions(questions, { dueIds: new Set(["WX-001"]) }).map(({ id }) => id)).toEqual(["WX-001"]);
      expect(filterQuestions(questions, { area: "V", topic: "impossible" })).toEqual([]);
    });

    it("should report duplicate identifiers and every structural rule", () => {
      const invalid = {
        ...validQuestion,
        acsCode: "bad",
        choices: ["same", "same"] as unknown as Question["choices"],
        correctIndex: 4 as unknown as Question["correctIndex"],
        explanation: "short",
        remediation: "short",
        citations: [],
        original: false as unknown as true,
      };
      const messages = validateQuestions([invalid, invalid]).join("\n");
      for (const expected of ["invalid ACS", "four choices", "unique", "correctIndex", "explanation", "remediation", "citation", "original", "duplicate id"]) {
        expect(messages).toContain(expected);
      }
    });
  });

  describe("generated question metadata", () => {
    it("should record review state for every generated distractor set", () => {
      const generated = loadQuestions().filter(({ id }) => id.startsWith("CARD-"));
      expect(generated.length).toBe(150);
      expect(generated.every(({ distractorReview }) => typeof distractorReview === "string")).toBe(true);
      expect(generated.every(({ distractorReview }) => distractorReview === "approved")).toBe(true);
    });
  });
});
