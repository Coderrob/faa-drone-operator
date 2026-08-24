import { citationList, escapeHtml } from "./quiz-view";
import type { SessionState } from "./quiz-session";
import type { PresentedQuestion } from "../../src/types";

/** Renders the overall score.
 * @param mode - Quiz mode.
 * @param correct - Correct count.
 * @param total - Total count.
 * @param percent - Score percentage.
 * @returns Summary HTML.
 */
export function scoreSummary(mode: SessionState["mode"], correct: number, total: number, percent: number): string {
  const passed = String(percent >= 70) as "true" | "false";
  const colors = { true: "text-emerald-700", false: "text-amber-700" };
  const examText = { true: "Meets the 70% practice threshold.", false: "Below the 70% practice threshold—remediate before retesting." };
  const descriptions = { exam: examText[passed], study: "Use the review below to choose your next study topic." };
  return `<div class="flex flex-wrap items-end gap-x-8 gap-y-3"><p class="font-display text-6xl font-bold ${colors[passed]}">${percent}%</p><div><p class="text-lg font-bold text-ink-950">${correct} of ${total} correct</p><p class="mt-1 text-sm text-slate-600">${descriptions[mode]}</p></div></div>`;
}

/** Renders area score cards.
 * @param presented - Presented questions.
 * @param completed - Completed session.
 * @param names - Area names.
 * @returns Cards HTML.
 */
export function areaScores(presented: PresentedQuestion[], completed: SessionState, names: Record<string, string>): string {
  return Object.keys(names).map((area) => areaScore(area, presented, completed, names)).join("");
}

/** Renders one area card.
 * @param area - ACS area.
 * @param presented - Presented questions.
 * @param completed - Completed session.
 * @param names - Area names.
 * @returns Card HTML.
 */
function areaScore(area: string, presented: PresentedQuestion[], completed: SessionState, names: Record<string, string>): string {
  const subset = presented.filter(({ question }) => question.area === area);
  if (!subset.length) return "";
  const correct = subset.filter((item) => completed.answers[item.question.id] === item.correctIndex).length;
  return `<div class="rounded-xl border border-slate-200 bg-slate-50 p-4"><p class="text-xs font-bold text-slate-500">Area ${area}</p><p class="mt-1 text-xl font-bold text-ink-950">${correct}/${subset.length}</p><p class="text-xs text-slate-500">${escapeHtml(names[area])}</p></div>`;
}

/** Renders remediation.
 * @param presented - Presented questions.
 * @param completed - Completed session.
 * @returns Review HTML.
 */
export function reviewHtml(presented: PresentedQuestion[], completed: SessionState): string {
  const items = presented.filter((item) => [completed.answers[item.question.id] !== item.correctIndex, completed.flagged.includes(item.question.id)].includes(true));
  if (!items.length) return `<div class="rounded-xl border border-emerald-300 bg-emerald-50 p-5 font-semibold text-emerald-900">No missed or flagged questions. Strong work.</div>`;
  return `<h3 class="font-display text-2xl font-bold text-ink-950">Review & remediation</h3>${items.map((item) => reviewItem(item, completed)).join("")}`;
}

/** Renders one review item.
 * @param item - Presented question.
 * @param completed - Completed session.
 * @returns Item HTML.
 */
function reviewItem(item: PresentedQuestion, completed: SessionState): string {
  const selected = completed.answers[item.question.id];
  const answer = selected === undefined ? "Unanswered" : escapeHtml(item.choices[selected]);
  return `<details class="rounded-xl border border-slate-200 bg-white p-5"><summary class="cursor-pointer font-bold text-ink-950">${escapeHtml(item.question.acsCode)} · ${escapeHtml(item.question.prompt)}</summary><div class="mt-4 text-sm leading-6 text-slate-700"><p><strong>Your answer:</strong> ${answer}</p><p class="mt-2"><strong>Correct answer:</strong> ${escapeHtml(item.choices[item.correctIndex])}</p><p class="mt-3">${escapeHtml(item.question.explanation)}</p><p class="mt-3 font-semibold">${escapeHtml(item.question.remediation)}</p>${citationList(item.question)}</div></details>`;
}
