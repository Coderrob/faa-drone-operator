import { describe, expect, it } from "vitest";
import { filterQuestions, loadQuestions, validateQuestions } from "../src/questions.js";
import type { Question } from "../src/types.js";

const validQuestion = loadQuestions()[0]!;

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
});

describe("canonical question validation", () => {
  it("supports each filter independently and rejects nonmatches", () => {
    const questions = loadQuestions();
    expect(filterQuestions(questions, { area: "I" }).every(({ area }) => area === "I")).toBe(true);
    expect(filterQuestions(questions, { topic: "  METAR  " }).some(({ id }) => id === "WX-001")).toBe(true);
    expect(filterQuestions(questions, { dueIds: new Set(["WX-001"]) }).map(({ id }) => id)).toEqual(["WX-001"]);
    expect(filterQuestions(questions, { area: "V", topic: "impossible" })).toEqual([]);
  });

  it("reports duplicate identifiers and every structural rule", () => {
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
  it("records review state for every generated distractor set", () => {
    const generated = loadQuestions().filter(({ id }) => id.startsWith("CARD-"));
    expect(generated.length).toBe(150);
    expect(generated.every(({ distractorReview }) => typeof distractorReview === "string")).toBe(true);
    expect(generated.every(({ distractorReview }) => distractorReview === "approved")).toBe(true);
  });
});
