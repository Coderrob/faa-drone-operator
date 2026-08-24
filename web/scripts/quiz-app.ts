import { presentQuestion, selectQuestions } from "../../src/quiz";
import type { PresentedQuestion, Question } from "../../src/types";

interface MockForm { id: string; title: string; timeLimitMinutes: number; passingPercent: number; questionIds: string[]; }
interface Payload { questions: Question[]; forms: MockForm[]; }
interface SessionState {
  version: 1;
  mode: "study" | "exam";
  seed: string;
  form?: string;
  questionIds: string[];
  current: number;
  answers: Record<string, number>;
  flagged: string[];
  startedAt: string;
  expiresAt?: number;
}
interface HistoryEntry { mode: string; form?: string; completedAt: string; correct: number; total: number; percent: number; }

const areaNames: Record<string, string> = { I: "Regulations", II: "Airspace", III: "Weather", IV: "Performance", V: "Operations" };
const escapeHtml = (value: unknown) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);

for (const root of document.querySelectorAll<HTMLElement>("[data-quiz-app]")) {
  const mode = root.dataset.mode as "study" | "exam";
  const payload = JSON.parse(root.querySelector<HTMLElement>("[data-quiz-data]")!.textContent!) as Payload;
  const questionsById = new Map(payload.questions.map((question) => [question.id, question]));
  const activeKey = `part107:web:${mode}:active`;
  const historyKey = "part107:web:history";
  let state: SessionState | undefined;
  let presented: PresentedQuestion[] = [];
  let timer: number | undefined;

  const element = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const setupPanel = element<HTMLElement>("[data-setup-panel]");
  const sessionPanel = element<HTMLElement>("[data-session-panel]");
  const resultsPanel = element<HTMLElement>("[data-results]");
  const form = element<HTMLFormElement>("[data-setup-form]");
  const resumeButton = element<HTMLButtonElement>("[data-resume]");
  const error = element<HTMLElement>("[data-setup-error]");

  function readActive(): SessionState | undefined {
    try {
      const parsed = JSON.parse(localStorage.getItem(activeKey) ?? "null") as SessionState | null;
      if (parsed?.version !== 1 || parsed.mode !== mode || parsed.questionIds.some((id) => !questionsById.has(id))) return undefined;
      return parsed;
    } catch { return undefined; }
  }

  function save(): void { if (state) localStorage.setItem(activeKey, JSON.stringify(state)); }

  function renderHistory(): void {
    const section = element<HTMLElement>("[data-recent-section]");
    const container = element<HTMLElement>("[data-recent-results]");
    let history: HistoryEntry[] = [];
    try { history = JSON.parse(localStorage.getItem(historyKey) ?? "[]") as HistoryEntry[]; } catch { history = []; }
    const recent = history.slice(-5).reverse();
    section.classList.toggle("hidden", recent.length === 0);
    container.innerHTML = recent.map((entry) => `<div class="rounded-xl bg-slate-50 p-4"><p class="text-xs font-bold text-slate-500">${escapeHtml(entry.mode === "exam" ? `Form ${entry.form ?? ""}` : "Study")}</p><p class="mt-1 text-2xl font-bold text-ink-950">${entry.percent}%</p><p class="text-xs text-slate-500">${entry.correct}/${entry.total} · ${escapeHtml(new Date(entry.completedAt).toLocaleDateString())}</p></div>`).join("");
  }

  function prepare(): void {
    if (!state) return;
    presented = state.questionIds.map((id) => presentQuestion(questionsById.get(id)!, state!.seed));
  }

  function begin(next: SessionState): void {
    state = next;
    prepare();
    save();
    setupPanel.classList.add("hidden");
    resultsPanel.classList.add("hidden");
    sessionPanel.classList.remove("hidden");
    startTimer();
    renderQuestion();
    element<HTMLElement>("[data-prompt]").focus({ preventScroll: true });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";
    const values = new FormData(form);
    const seed = String(values.get("seed") ?? "").trim();
    if (!seed) { error.textContent = "Enter a session seed."; return; }
    let selected: Question[];
    let formId: string | undefined;
    let expiresAt: number | undefined;
    if (mode === "exam") {
      formId = String(values.get("form") ?? "A");
      const examForm = payload.forms.find(({ id }) => id === formId);
      if (!examForm) { error.textContent = "The selected exam form is unavailable."; return; }
      selected = examForm.questionIds.map((id) => questionsById.get(id)!).filter(Boolean);
      expiresAt = Date.now() + examForm.timeLimitMinutes * 60_000;
    } else {
      const area = String(values.get("area") ?? "");
      const topic = String(values.get("topic") ?? "").trim().toLowerCase();
      const count = Number(values.get("count") ?? 10);
      const candidates = payload.questions.filter((question) => (!area || question.area === area) && (!topic || question.topic.toLowerCase().includes(topic)));
      if (candidates.length < count) { error.textContent = `Only ${candidates.length} questions match. Reduce the count or broaden the filter.`; return; }
      selected = selectQuestions(candidates, count, seed);
    }
    begin({ version: 1, mode, seed, ...(formId ? { form: formId } : {}), questionIds: selected.map(({ id }) => id), current: 0, answers: {}, flagged: [], startedAt: new Date().toISOString(), ...(expiresAt ? { expiresAt } : {}) });
  });

  function renderQuestion(): void {
    if (!state) return;
    const item = presented[state.current]!;
    const question = item.question;
    const selected = state.answers[question.id];
    const answered = selected !== undefined;
    const isStudyRevealed = mode === "study" && answered;
    const percent = Math.round(((state.current + 1) / presented.length) * 100);
    element<HTMLElement>("[data-progress-label]").textContent = `Question ${state.current + 1} of ${presented.length}`;
    element<HTMLElement>("[data-progress-percent]").textContent = `${percent}%`;
    element<HTMLElement>("[data-progress-bar]").style.width = `${percent}%`;
    element<HTMLElement>("[data-acs-code]").textContent = `${question.acsCode} · ${areaNames[question.area]}`;
    const prompt = element<HTMLElement>("[data-prompt]");
    prompt.textContent = question.prompt;
    prompt.tabIndex = -1;
    const choices = element<HTMLElement>("[data-choices]");
    choices.innerHTML = item.choices.map((choice, index) => {
      const chosen = selected === index;
      const correct = item.correctIndex === index;
      const stateClass = isStudyRevealed && correct ? "border-emerald-500 bg-emerald-50" : isStudyRevealed && chosen ? "border-red-400 bg-red-50" : chosen ? "border-sky-500 bg-sky-50" : "border-slate-300 bg-white hover:border-sky-400";
      return `<button type="button" data-choice="${index}" aria-pressed="${chosen}" class="flex min-h-14 w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition ${stateClass}"><span class="grid size-7 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">${index + 1}</span><span class="pt-0.5 text-sm leading-6 sm:text-base">${escapeHtml(choice)}</span></button>`;
    }).join("");
    choices.querySelectorAll<HTMLButtonElement>("[data-choice]").forEach((button) => button.addEventListener("click", () => answer(Number(button.dataset.choice))));
    const flag = element<HTMLButtonElement>("[data-flag]");
    const flagged = state.flagged.includes(question.id);
    flag.setAttribute("aria-pressed", String(flagged));
    flag.textContent = flagged ? "Flagged for review" : "Flag for review";
    flag.classList.toggle("border-amber-500", flagged);
    flag.classList.toggle("bg-amber-50", flagged);
    renderFeedback(item, selected);
    element<HTMLButtonElement>("[data-previous]").disabled = state.current === 0;
    element<HTMLButtonElement>("[data-next]").textContent = state.current === presented.length - 1 ? "Finish session" : "Next question";
    renderNavigator();
    save();
  }

  function answer(index: number): void {
    if (!state) return;
    const question = presented[state.current]!.question;
    if (mode === "study" && state.answers[question.id] !== undefined) return;
    state.answers[question.id] = index;
    renderQuestion();
  }

  function renderFeedback(item: PresentedQuestion, selected?: number): void {
    const feedback = element<HTMLElement>("[data-feedback]");
    if (mode !== "study" || selected === undefined) { feedback.className = "mt-6 hidden rounded-xl border p-5"; feedback.innerHTML = ""; return; }
    const correct = selected === item.correctIndex;
    feedback.className = `mt-6 rounded-xl border p-5 ${correct ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`;
    feedback.innerHTML = `<p class="font-bold ${correct ? "text-emerald-900" : "text-red-900"}">${correct ? "Correct" : "Review this objective"}</p><p class="mt-2 text-sm leading-6 text-slate-700">${escapeHtml(item.question.explanation)}</p><p class="mt-3 text-sm font-semibold text-slate-700">${escapeHtml(item.question.remediation)}</p>${citationList(item.question)}`;
  }

  function citationList(question: Question): string {
    return `<ul class="mt-4 space-y-1 text-xs text-slate-600">${question.citations.map((citation) => `<li><a class="font-semibold text-sky-700 underline" href="${escapeHtml(citation.url)}" target="_blank" rel="noreferrer">${escapeHtml(citation.label)}</a> — ${escapeHtml(citation.locator)}</li>`).join("")}</ul>`;
  }

  function renderNavigator(): void {
    if (!state) return;
    element<HTMLElement>("[data-navigator]").innerHTML = presented.map(({ question }, index) => {
      const active = index === state!.current;
      const answered = state!.answers[question.id] !== undefined;
      const flagged = state!.flagged.includes(question.id);
      return `<button type="button" data-jump="${index}" aria-label="Question ${index + 1}${answered ? ", answered" : ""}${flagged ? ", flagged" : ""}" class="grid size-9 place-items-center rounded-md border text-xs font-bold ${active ? "border-ink-900 bg-ink-900 text-white" : flagged ? "border-amber-500 bg-amber-50 text-amber-900" : answered ? "border-sky-400 bg-sky-50 text-sky-900" : "border-slate-300 bg-white text-slate-600"}">${index + 1}</button>`;
    }).join("");
    element<HTMLElement>("[data-navigator]").querySelectorAll<HTMLButtonElement>("[data-jump]").forEach((button) => button.addEventListener("click", () => navigate(Number(button.dataset.jump))));
  }

  function navigate(index: number): void { if (!state || index < 0 || index >= presented.length) return; state.current = index; renderQuestion(); element<HTMLElement>("[data-prompt]").focus(); }

  function toggleFlag(): void {
    if (!state) return;
    const id = presented[state.current]!.question.id;
    state.flagged = state.flagged.includes(id) ? state.flagged.filter((value) => value !== id) : [...state.flagged, id];
    renderQuestion();
  }

  function finish(force = false): void {
    if (!state) return;
    if (!force && mode === "exam" && Object.keys(state.answers).length < presented.length && !confirm(`You have ${presented.length - Object.keys(state.answers).length} unanswered questions. Finish anyway?`)) return;
    if (timer) window.clearInterval(timer);
    const completed = state;
    const correct = presented.filter((item) => completed.answers[item.question.id] === item.correctIndex).length;
    const percent = Math.round((correct / presented.length) * 100);
    const history: HistoryEntry[] = JSON.parse(localStorage.getItem(historyKey) ?? "[]");
    history.push({ mode, ...(completed.form ? { form: completed.form } : {}), completedAt: new Date().toISOString(), correct, total: presented.length, percent });
    localStorage.setItem(historyKey, JSON.stringify(history.slice(-50)));
    renderHistory();
    localStorage.removeItem(activeKey);
    sessionPanel.classList.add("hidden");
    resultsPanel.classList.remove("hidden");
    renderResults(completed, correct, percent);
    resultsPanel.focus();
  }

  function renderResults(completed: SessionState, correct: number, percent: number): void {
    const passed = percent >= 70;
    element<HTMLElement>("[data-score-summary]").innerHTML = `<div class="flex flex-wrap items-end gap-x-8 gap-y-3"><p class="font-display text-6xl font-bold ${passed ? "text-emerald-700" : "text-amber-700"}">${percent}%</p><div><p class="text-lg font-bold text-ink-950">${correct} of ${presented.length} correct</p><p class="mt-1 text-sm text-slate-600">${mode === "exam" ? (passed ? "Meets the 70% practice threshold." : "Below the 70% practice threshold—remediate before retesting.") : "Use the review below to choose your next study topic."}</p></div></div>`;
    element<HTMLElement>("[data-area-scores]").innerHTML = Object.keys(areaNames).map((area) => {
      const subset = presented.filter(({ question }) => question.area === area);
      if (!subset.length) return "";
      const areaCorrect = subset.filter((item) => completed.answers[item.question.id] === item.correctIndex).length;
      return `<div class="rounded-xl border border-slate-200 bg-slate-50 p-4"><p class="text-xs font-bold text-slate-500">Area ${area}</p><p class="mt-1 text-xl font-bold text-ink-950">${areaCorrect}/${subset.length}</p><p class="text-xs text-slate-500">${escapeHtml(areaNames[area])}</p></div>`;
    }).join("");
    const reviewItems = presented.filter((item) => completed.answers[item.question.id] !== item.correctIndex || completed.flagged.includes(item.question.id));
    element<HTMLElement>("[data-review]").innerHTML = reviewItems.length ? `<h3 class="font-display text-2xl font-bold text-ink-950">Review & remediation</h3>${reviewItems.map((item) => {
      const selected = completed.answers[item.question.id];
      return `<details class="rounded-xl border border-slate-200 bg-white p-5"><summary class="cursor-pointer font-bold text-ink-950">${escapeHtml(item.question.acsCode)} · ${escapeHtml(item.question.prompt)}</summary><div class="mt-4 text-sm leading-6 text-slate-700"><p><strong>Your answer:</strong> ${selected === undefined ? "Unanswered" : escapeHtml(item.choices[selected])}</p><p class="mt-2"><strong>Correct answer:</strong> ${escapeHtml(item.choices[item.correctIndex])}</p><p class="mt-3">${escapeHtml(item.question.explanation)}</p><p class="mt-3 font-semibold">${escapeHtml(item.question.remediation)}</p>${citationList(item.question)}</div></details>`;
    }).join("")}` : `<div class="rounded-xl border border-emerald-300 bg-emerald-50 p-5 font-semibold text-emerald-900">No missed or flagged questions. Strong work.</div>`;
  }

  function startTimer(): void {
    if (timer) window.clearInterval(timer);
    if (mode !== "exam" || !state?.expiresAt) return;
    const display = element<HTMLElement>("[data-timer]");
    const tick = () => {
      if (!state?.expiresAt) return;
      const remaining = Math.max(0, state.expiresAt - Date.now());
      const totalSeconds = Math.ceil(remaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      display.textContent = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
      display.classList.toggle("bg-red-700", remaining <= 10 * 60_000);
      if (remaining === 0) finish(true);
    };
    tick();
    timer = window.setInterval(tick, 1000);
  }

  element<HTMLButtonElement>("[data-previous]").addEventListener("click", () => navigate((state?.current ?? 0) - 1));
  element<HTMLButtonElement>("[data-next]").addEventListener("click", () => state && state.current === presented.length - 1 ? finish() : navigate((state?.current ?? 0) + 1));
  element<HTMLButtonElement>("[data-flag]").addEventListener("click", toggleFlag);
  element<HTMLButtonElement>("[data-exit]").addEventListener("click", () => { save(); if (timer) window.clearInterval(timer); sessionPanel.classList.add("hidden"); setupPanel.classList.remove("hidden"); resumeButton.classList.remove("hidden"); });
  element<HTMLButtonElement>("[data-new-session]").addEventListener("click", () => { resultsPanel.classList.add("hidden"); setupPanel.classList.remove("hidden"); state = undefined; });
  element<HTMLButtonElement>("[data-clear-history]").addEventListener("click", () => { if (confirm("Clear locally saved quiz history?")) { localStorage.removeItem(historyKey); renderHistory(); } });
  resumeButton.addEventListener("click", () => { const active = readActive(); if (active) begin(active); });
  document.addEventListener("keydown", (event) => {
    if (sessionPanel.classList.contains("hidden") || event.altKey || event.ctrlKey || event.metaKey) return;
    if (/^[1-4]$/.test(event.key)) answer(Number(event.key) - 1);
    else if (event.key === "ArrowLeft") navigate((state?.current ?? 0) - 1);
    else if (event.key === "ArrowRight") state && state.current === presented.length - 1 ? finish() : navigate((state?.current ?? 0) + 1);
    else if (event.key.toLowerCase() === "f") toggleFlag();
  });

  if (readActive()) resumeButton.classList.remove("hidden");
  renderHistory();
}
