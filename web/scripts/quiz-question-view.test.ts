import { describe, expect, it, vi } from "vitest";
import { renderQuestionContent } from "./quiz-question-view";
import type { PresentedQuestion, Question } from "../../src/types";

const question: Question = {
  id: "q1",
  acsCode: "UA.I.A.K1",
  area: "I",
  task: "Rules",
  topic: "Safety",
  difficulty: 1,
  critical: false,
  prompt: "Choose safely",
  choices: ["A", "B", "C", "D"],
  correctIndex: 0,
  explanation: "A sufficiently detailed explanation for this fixture.",
  remediation: "Review the source.",
  citations: [],
  original: true,
};

describe("quiz-question-view", () => {
  describe("renderQuestionContent", () => {
    it("should render question content and connect answer selection", () => {
      const onAnswer = vi.fn();
      const addEventListener = vi.fn();
      const button = { dataset: { choice: "2" }, addEventListener };
      const choices = { innerHTML: "", querySelectorAll: vi.fn().mockReturnValue([button]) };
      const elements = new Map<string, object>([
        ["[data-progress-label]", { textContent: "" }],
        ["[data-progress-percent]", { textContent: "" }],
        ["[data-progress-bar]", { style: { width: "" } }],
        ["[data-acs-code]", { textContent: "" }],
        ["[data-prompt]", { textContent: "" }],
        ["[data-choices]", choices],
      ]);
      const root = { querySelector: elements.get.bind(elements) } as unknown as HTMLElement;
      const item: PresentedQuestion = { question, choices: question.choices, correctIndex: 0 };
      renderQuestionContent({ root, item, selected: undefined, revealed: false, current: 0, total: 4, areaName: "Regulations", onAnswer });
      const listener = addEventListener.mock.calls[0]![1] as () => void;
      listener();
      expect(elements.get("[data-progress-label]")).toEqual({ textContent: "Question 1 of 4" });
      expect(choices.innerHTML).toContain("data-choice");
      expect(onAnswer).toHaveBeenCalledWith(2);
    });
  });
});
