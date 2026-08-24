import { describe, expect, it } from "vitest";
import { correctAnswerCount, formatRemaining, isCompatibleSession, parseHistory, parseSession, scorePercent, toggleQuestionFlag } from "./quiz-session";
import type { PresentedQuestion, Question } from "../../src/types";

const session = { version: 1 as const, mode: "study" as const, seed: "seed", questionIds: ["q1"], current: 0, answers: {}, flagged: [], startedAt: "2026-01-01T00:00:00Z" };
const question = { id: "q1", acsCode: "UA.I.A.K1", area: "I", task: "A", topic: "Rules", difficulty: 1, critical: false, prompt: "Prompt", choices: ["A", "B", "C", "D"], correctIndex: 1, explanation: "Why", remediation: "Review", citations: [], original: true } as Question;
const presented: PresentedQuestion[] = [{ question, choices: question.choices, correctIndex: 1 }];

// eslint-disable-next-line max-lines-per-function -- Root suite groups function-level describes.
describe("quiz-session", () => {
describe("isCompatibleSession", () => {
  it("should validate compatible sessions", () => {
    expect(isCompatibleSession(session, "study", new Set(["q1"]))).toBe(true);
    expect(isCompatibleSession(session, "exam", new Set(["q1"]))).toBe(false);
    expect(isCompatibleSession(session, "study", new Set())).toBe(false);
    expect(isCompatibleSession(null, "study", new Set())).toBe(false);
  });

});

describe("parseSession", () => {
  it("should parse sessions defensively", () => {
    expect(parseSession(JSON.stringify(session), "study", new Set(["q1"]))).toEqual(session);
    expect(parseSession("{", "study", new Set())).toBeUndefined();
    expect(parseSession(null, "study", new Set())).toBeUndefined();
  });

});

describe("parseHistory", () => {
  it("should parse history defensively", () => {
    expect(parseHistory("[]")).toEqual([]);
    expect(parseHistory("{}" )).toEqual([]);
    expect(parseHistory("{")).toEqual([]);
    expect(parseHistory(null)).toEqual([]);
  });
});

describe("correctAnswerCount", () => {
  it("should count correct answers", () => {
    expect(correctAnswerCount(presented, { q1: 1 })).toBe(1);
    expect(correctAnswerCount(presented, { q1: 0 })).toBe(0);
  });
});

describe("scorePercent", () => {
  it("should calculate rounded percentages", () => {
    expect(scorePercent(2, 3)).toBe(67);
    expect(scorePercent(0, 0)).toBe(0);
  });

});

describe("formatRemaining", () => {
  it("should format remaining time", () => {
    expect(formatRemaining(3_661_000)).toBe("01:01:01");
    expect(formatRemaining(-1)).toBe("00:00:00");
  });

});

describe("toggleQuestionFlag", () => {
  it("should toggle flags immutably", () => {
    expect(toggleQuestionFlag([], "q1")).toEqual(["q1"]);
    expect(toggleQuestionFlag(["q1", "q2"], "q1")).toEqual(["q2"]);
  });
});
});
