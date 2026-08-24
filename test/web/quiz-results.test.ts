import { describe, expect, it } from "vitest";
import type { PresentedQuestion, Question } from "../../src/types";
import { areaScores, reviewHtml, scoreSummary } from "../../web/lib/quiz-results";
import type { SessionState } from "../../web/lib/quiz-session";

const question = { id: "q1", acsCode: "UA.I.A.K1", area: "I", prompt: "Prompt", explanation: "Why", remediation: "Review", citations: [] } as unknown as Question;
const presented: PresentedQuestion[] = [{ question, choices: ["A", "B"], correctIndex: 1 }];
const state: SessionState = { version: 1, mode: "study", seed: "s", questionIds: ["q1"], current: 0, answers: { q1: 1 }, flagged: [], startedAt: "now" };

describe("quiz result views", () => {
  it("renders score states", () => {
    expect(scoreSummary("exam", 1, 1, 100)).toContain("Meets the 70%");
    expect(scoreSummary("exam", 0, 1, 0)).toContain("Below the 70%");
    expect(scoreSummary("study", 1, 1, 100)).toContain("next study topic");
  });

  it("renders area cards and skips empty areas", () => {
    const html = areaScores(presented, state, { I: "Rules", II: "Airspace" });
    expect(html).toContain("1/1");
    expect(html).not.toContain("Airspace");
  });

  it("renders clean and remediation states", () => {
    expect(reviewHtml(presented, state)).toContain("Strong work");
    expect(reviewHtml(presented, { ...state, answers: {} })).toContain("Unanswered");
    expect(reviewHtml(presented, { ...state, answers: { q1: 0 }, flagged: ["q1"] })).toContain("Review & remediation");
  });
});
