import { describe, expect, it } from "vitest";
import { areaScores, reviewHtml, scoreSummary } from "./quiz-results";
import type { SessionState } from "./quiz-session";
import type { PresentedQuestion, Question } from "../../src/types";

const question = {
  id: "q1",
  acsCode: "UA.I.A.K1",
  area: "I",
  prompt: "Prompt",
  explanation: "Why",
  remediation: "Review",
  citations: [],
} as unknown as Question;
const presented: PresentedQuestion[] = [{ question, choices: ["A", "B"], correctIndex: 1 }];
const state: SessionState = {
  version: 1,
  mode: "study",
  seed: "s",
  questionIds: ["q1"],
  current: 0,
  answers: { q1: 1 },
  flagged: [],
  startedAt: "now",
};

describe("quiz-results", () => {
  describe("scoreSummary, areaScores, and reviewHtml", () => {
    it("should render score states", () => {
      expect(scoreSummary("exam", 1, 1, 100)).toContain("Meets the 70%");
      expect(scoreSummary("exam", 0, 1, 0)).toContain("Below the 70%");
      expect(scoreSummary("study", 1, 1, 100)).toContain("next study topic");
    });

    it("should render area cards and skip empty areas", () => {
      const html = areaScores(presented, state, { I: "Rules", II: "Airspace" });
      expect(html).toContain("1/1");
      expect(html).not.toContain("Airspace");
    });

    it("should render clean and remediation states", () => {
      expect(reviewHtml(presented, state)).toContain("Strong work");
      expect(reviewHtml(presented, { ...state, answers: {} })).toContain("Unanswered");
      expect(reviewHtml(presented, { ...state, answers: { q1: 0 }, flagged: ["q1"] })).toContain("Review & remediation");
    });
  });
});
