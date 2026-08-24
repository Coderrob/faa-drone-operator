import { choiceButton } from "../lib/quiz-view";
import type { PresentedQuestion } from "../../src/types";

interface QuestionContent {
  root: HTMLElement;
  item: PresentedQuestion;
  selected: number | undefined;
  revealed: boolean;
  current: number;
  total: number;
  areaName: string;
  onAnswer: (index: number) => void;
}

/**
 * Renders progress, prompt, and selectable answers for one question.
 * @param content - Question data, DOM root, and answer callback.
 * @returns Nothing.
 */
export function renderQuestionContent(content: QuestionContent): void {
  const { root, item, selected, revealed, current, total, areaName, onAnswer } = content;
  const percent = Math.round(((current + 1) / total) * 100);
  root.querySelector<HTMLElement>("[data-progress-label]")!.textContent = `Question ${current + 1} of ${total}`;
  root.querySelector<HTMLElement>("[data-progress-percent]")!.textContent = `${percent}%`;
  root.querySelector<HTMLElement>("[data-progress-bar]")!.style.width = `${percent}%`;
  root.querySelector<HTMLElement>("[data-acs-code]")!.textContent = `${item.question.acsCode} · ${areaName}`;
  root.querySelector<HTMLElement>("[data-prompt]")!.textContent = item.question.prompt;
  const choices = root.querySelector<HTMLElement>("[data-choices]")!;
  choices.innerHTML = item.choices.map((choice, index) => choiceButton(choice, index, selected, item.correctIndex, revealed)).join("");
  choices.querySelectorAll<HTMLButtonElement>("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      onAnswer(Number(button.dataset.choice));
    });
  });
}
