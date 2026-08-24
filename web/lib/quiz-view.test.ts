import { describe, expect, it } from "vitest";
import { choiceButton, citationList, escapeHtml, feedbackView, historyCards, navigatorButton } from "./quiz-view";
import type { PresentedQuestion, Question } from "../../src/types";

const question: Question = {
  id: "q1",
  acsCode: "UA.I.A.K1",
  area: "I",
  task: "Rules",
  topic: "Safety",
  difficulty: 1,
  critical: false,
  prompt: "Prompt",
  choices: ["A", "B", "C", "D"],
  correctIndex: 0,
  explanation: "A sufficiently detailed explanation for this fixture.",
  remediation: "Review the cited source.",
  original: true,
  citations: [{ label: "FAA & ACS", url: "https://example.test/?a=1&b=2", locator: "p. <1>" }],
};

// eslint-disable-next-line max-lines-per-function -- Root suite groups function-level describes.
describe("quiz-view", () => {
  describe("escapeHtml, citationList, and choiceButton", () => {
    it("should escape all significant HTML characters", () => {
      expect(escapeHtml(`<a href='x'>&"`)).toBe("&lt;a href=&#39;x&#39;&gt;&amp;&quot;");
    });

    it("should render safe citation markup", () => {
      const html = citationList(question);
      expect(html).toContain("FAA &amp; ACS");
      expect(html).toContain("a=1&amp;b=2");
      expect(html).toContain("p. &lt;1&gt;");
    });

    it("should render each answer-choice state", () => {
      expect(choiceButton("<A>", 0, undefined, 1, false)).toContain("hover:border-sky-400");
      expect(choiceButton("A", 0, 0, 1, false)).toContain("border-sky-500");
      expect(choiceButton("A", 0, 0, 1, true)).toContain("border-red-400");
      expect(choiceButton("A", 1, 0, 1, true)).toContain("border-emerald-500");
      expect(choiceButton("A", 1, 1, 1, true)).toContain("border-emerald-500");
      expect(choiceButton("A", 0, 1, 1, true)).toContain("hover:border-sky-400");
      expect(choiceButton("<A>", 0, undefined, 1, false)).toContain("&lt;A&gt;");
    });
  });

  describe("feedbackView and navigatorButton", () => {
    const item: PresentedQuestion = {
      question: { ...question, id: "q1", explanation: "Why", remediation: "Review" },
      choices: ["A", "B"],
      correctIndex: 1,
    };

    it("should render feedback and navigator states", () => {
      expect(feedbackView(item, undefined, false).html).toBe("");
      expect(feedbackView(item, 1, true).html).toContain("Correct");
      expect(feedbackView(item, 0, true).html).toContain("Review this objective");
      expect(navigatorButton(item.question, 0, 0, new Set(["q1"]), new Set())).toContain("bg-ink-900");
      expect(navigatorButton(item.question, 1, 0, new Set(), new Set(["q1"]))).toContain("bg-amber-50");
      expect(navigatorButton(item.question, 1, 0, new Set(["q1"]), new Set())).toContain("bg-sky-50");
      expect(navigatorButton(item.question, 1, 0, new Set(), new Set())).toContain("text-slate-600");
    });
  });

  describe("historyCards", () => {
    it("should render only the five newest history entries newest first", () => {
      const entries = Array.from({ length: 6 }, (_, index) => ({
        mode: index ? "study" : "exam",
        form: "A",
        completedAt: "2026-01-01T00:00:00Z",
        correct: index,
        total: 10,
        percent: index * 10,
      }));
      const html = historyCards(entries);
      expect(html.match(/rounded-xl bg-slate-50/g)).toHaveLength(5);
      expect(html.indexOf("50%")).toBeLessThan(html.indexOf("10%"));
      expect(html).not.toContain("Form A");
    });

    it("should render the exam form label", () => {
      const html = historyCards([{ mode: "exam", form: "B", completedAt: "2026-01-01T00:00:00Z", correct: 1, total: 1, percent: 100 }]);
      expect(html).toContain("Form B");
      expect(historyCards([{ mode: "exam", completedAt: "2026-01-01T00:00:00Z", correct: 0, total: 1, percent: 0 }])).toContain("Form ");
    });
  });
});
