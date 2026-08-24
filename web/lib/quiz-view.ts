import type { HistoryEntry } from "./quiz-session";
import type { Question, PresentedQuestion } from "../../src/types";

const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
const choiceClasses = {
  correct: "border-emerald-500 bg-emerald-50",
  incorrect: "border-red-400 bg-red-50",
  selected: "border-sky-500 bg-sky-50",
  idle: "border-slate-300 bg-white hover:border-sky-400",
} as const;

/**
 * Escapes a value for safe insertion into HTML markup.
 * @param value - Value to serialize.
 * @returns HTML-safe text.
 */
export function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>'"]/g, (character) => entities[character]!);
}

/**
 * Renders one selectable answer choice.
 * @param choice - Choice text.
 * @param index - Presented choice index.
 * @param selected - Currently selected index.
 * @param correctIndex - Correct presented index.
 * @param revealed - Whether correctness should be visible.
 * @returns Answer-button HTML.
 */
export function choiceButton(choice: string, index: number, selected: number | undefined, correctIndex: number, revealed: boolean): string {
  const state = choiceState(index, selected, correctIndex, revealed);
  return `<button type="button" data-choice="${index}" aria-pressed="${selected === index}" class="flex min-h-14 w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition ${choiceClasses[state]}"><span class="grid size-7 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">${index + 1}</span><span class="pt-0.5 text-sm leading-6 sm:text-base">${escapeHtml(choice)}</span></button>`;
}

/**
 * Classifies the visible state of an answer choice.
 * @param index - Presented choice index.
 * @param selected - Currently selected index.
 * @param correctIndex - Correct presented index.
 * @param revealed - Whether correctness should be visible.
 * @returns Choice presentation state.
 */
function choiceState(index: number, selected: number | undefined, correctIndex: number, revealed: boolean): keyof typeof choiceClasses {
  const key = `${revealed}:${index === correctIndex}:${index === selected}`;
  const states: Record<string, keyof typeof choiceClasses> = {
    "true:true:false": "correct",
    "true:true:true": "correct",
    "true:false:true": "incorrect",
    "true:false:false": "idle",
    "false:true:true": "selected",
    "false:false:true": "selected",
    "false:true:false": "idle",
    "false:false:false": "idle",
  };
  return states[key]!;
}

/**
 * Renders source citations for a quiz question.
 * @param question - Question containing authoritative citations.
 * @returns Citation-list HTML.
 */
export function citationList(question: Question): string {
  const items = question.citations.map(renderCitation).join("");
  return `<ul class="mt-4 space-y-1 text-xs text-slate-600">${items}</ul>`;
}

/**
 * Renders one source citation.
 * @param citation - Citation metadata to display.
 * @returns Citation-item HTML.
 */
function renderCitation(citation: Question["citations"][number]): string {
  return `<li><a class="font-semibold text-sky-700 underline" href="${escapeHtml(citation.url)}" target="_blank" rel="noreferrer">${escapeHtml(citation.label)}</a> — ${escapeHtml(citation.locator)}</li>`;
}

/**
 * Renders the five most recent quiz results.
 * @param history - Complete saved quiz history.
 * @returns Recent-result card HTML.
 */
export function historyCards(history: HistoryEntry[]): string {
  return history.slice(-5).reverse().map(renderHistoryEntry).join("");
}

/**
 * Renders study feedback or an empty hidden panel state.
 * @param item - Presented question to explain.
 * @param selected - Selected answer index.
 * @param visible - Whether feedback is available.
 * @returns Feedback class name and HTML.
 */
export function feedbackView(item: PresentedQuestion, selected: number | undefined, visible: boolean): { className: string; html: string } {
  if (!visible) return { className: "mt-6 hidden rounded-xl border p-5", html: "" };
  const correct = selected === item.correctIndex;
  const state = String(correct) as "true" | "false";
  const colors = { true: "border-emerald-300 bg-emerald-50", false: "border-red-300 bg-red-50" };
  const text = { true: "text-emerald-900", false: "text-red-900" };
  const title = { true: "Correct", false: "Review this objective" };
  const html = `<p class="font-bold ${text[state]}">${title[state]}</p><p class="mt-2 text-sm leading-6 text-slate-700">${escapeHtml(item.question.explanation)}</p><p class="mt-3 text-sm font-semibold text-slate-700">${escapeHtml(item.question.remediation)}</p>${citationList(item.question)}`;
  return { className: `mt-6 rounded-xl border p-5 ${colors[state]}`, html };
}

/**
 * Renders a question navigator button.
 * @param question - Question being indexed.
 * @param index - Zero-based question index.
 * @param current - Current question index.
 * @param answeredIds - Answered question identifiers.
 * @param flaggedIds - Flagged question identifiers.
 * @returns Navigator-button HTML.
 */
export function navigatorButton(question: Question, index: number, current: number, answeredIds: ReadonlySet<string>, flaggedIds: ReadonlySet<string>): string {
  const states = {
    active: "border-ink-900 bg-ink-900 text-white",
    flagged: "border-amber-500 bg-amber-50 text-amber-900",
    answered: "border-sky-400 bg-sky-50 text-sky-900",
    idle: "border-slate-300 bg-white text-slate-600",
  };
  const state = navigatorState(index, current, answeredIds.has(question.id), flaggedIds.has(question.id));
  const labels = { true: ", answered", false: "" };
  const flags = { true: ", flagged", false: "" };
  return `<button type="button" data-jump="${index}" aria-label="Question ${index + 1}${labels[String(answeredIds.has(question.id)) as "true" | "false"]}${flags[String(flaggedIds.has(question.id)) as "true" | "false"]}" class="grid size-9 place-items-center rounded-md border text-xs font-bold ${states[state]}">${index + 1}</button>`;
}

/**
 * Chooses navigator priority without conditional branches.
 * @param index - Question index.
 * @param current - Current index.
 * @param answered - Whether the question is answered.
 * @param flagged - Whether the question is flagged.
 * @returns Navigator visual state.
 */
function navigatorState(index: number, current: number, answered: boolean, flagged: boolean): "active" | "flagged" | "answered" | "idle" {
  const key = `${index === current}:${flagged}:${answered}`;
  const states: Record<string, "active" | "flagged" | "answered" | "idle"> = {
    "true:true:true": "active",
    "true:true:false": "active",
    "true:false:true": "active",
    "true:false:false": "active",
    "false:true:true": "flagged",
    "false:true:false": "flagged",
    "false:false:true": "answered",
    "false:false:false": "idle",
  };
  return states[key]!;
}

/**
 * Renders one quiz-history card.
 * @param entry - Completed quiz result.
 * @returns History-card HTML.
 */
function renderHistoryEntry(entry: HistoryEntry): string {
  const label = entry.mode === "exam" ? `Form ${entry.form ?? ""}` : "Study";
  const date = new Date(entry.completedAt).toLocaleDateString();
  return `<div class="rounded-xl bg-slate-50 p-4"><p class="text-xs font-bold text-slate-500">${escapeHtml(label)}</p><p class="mt-1 text-2xl font-bold text-ink-950">${entry.percent}%</p><p class="text-xs text-slate-500">${entry.correct}/${entry.total} · ${escapeHtml(date)}</p></div>`;
}
