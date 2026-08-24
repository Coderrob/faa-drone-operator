import { presentQuestion, selectQuestions } from "../../src/quiz";
import type { PresentedQuestion } from "../../src/types";
import { correctAnswerCount, formatRemaining, parseHistory, parseSession, scorePercent, toggleQuestionFlag } from "../lib/quiz-session";
import type { HistoryEntry, QuizPayload as Payload, SessionState } from "../lib/quiz-session";
import { answerLocked, cancelFinish, currentIndex, formValue, historyEntry, matchesFilters, newSession, timerExpiry, validIndex } from "../lib/quiz-controller";
import { choiceButton, feedbackView, historyCards, navigatorButton } from "../lib/quiz-view";
import { areaScores, reviewHtml, scoreSummary } from "../lib/quiz-results";

const areaNames: Record<string, string> = { I: "Regulations", II: "Airspace", III: "Weather", IV: "Performance", V: "Operations" };

for (const root of document.querySelectorAll<HTMLElement>("[data-quiz-app]")) {
  const mode = root.dataset.mode as "study" | "exam";
  const payload = JSON.parse(root.querySelector<HTMLElement>("[data-quiz-data]")!.textContent!) as Payload;
  const questionsById = new Map(payload.questions.map((question) => [question.id, question]));
  const activeKey = `part107:web:${mode}:active`;
  const historyKey = "part107:web:history";
  let state: SessionState | undefined;
  let presented: PresentedQuestion[] = [];
  let timer: number | undefined;

  /**
   * Finds a required quiz element.
   * @param selector - Element selector.
   * @returns The matched element.
   */
  const element = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const setupPanel = element<HTMLElement>("[data-setup-panel]");
  const sessionPanel = element<HTMLElement>("[data-session-panel]");
  const resultsPanel = element<HTMLElement>("[data-results]");
  const form = element<HTMLFormElement>("[data-setup-form]");
  const resumeButton = element<HTMLButtonElement>("[data-resume]");
  const error = element<HTMLElement>("[data-setup-error]");

  /**
   * Reads the resumable session.
   * @returns A compatible session when saved.
   */
  function readActive(): SessionState | undefined {
    return parseSession(localStorage.getItem(activeKey), mode, new Set(questionsById.keys()));
  }

  /** Persists the current session. */
  function save(): void { if (state) localStorage.setItem(activeKey, JSON.stringify(state)); }

  /** Refreshes recent-result cards. */
  function renderHistory(): void {
    const section = element<HTMLElement>("[data-recent-section]");
    const container = element<HTMLElement>("[data-recent-results]");
    const history = parseHistory(localStorage.getItem(historyKey));
    const recent = history.slice(-5);
    section.classList.toggle("hidden", recent.length === 0);
    container.innerHTML = historyCards(history);
  }

  /** Materializes questions for the current seed. */
  function prepare(): void {
    if (!state) return;
    presented = state.questionIds.map((id) => presentQuestion(questionsById.get(id)!, state!.seed));
  }

  /**
   * Starts or resumes a quiz.
   * @param next - Session to activate.
   */
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

  /**
   * Starts an exam from submitted form values. @param values - Submitted values. @param seed - Session seed.
   * @param values - Submitted values.
   * @param seed - Session seed.
   */
  function startExam(values: FormData, seed: string): void {
    const formId = String(values.get("form") ?? "A");
    const examForm = payload.forms.find(({ id }) => id === formId);
    if (!examForm) { error.textContent = "The selected exam form is unavailable."; return; }
    const selected = examForm.questionIds.map((id) => questionsById.get(id)!).filter(Boolean);
    const expiresAt = Date.now() + examForm.timeLimitMinutes * 60_000;
    begin(newSession(mode, seed, selected, { form: formId, expiresAt }));
  }

  /**
   * Starts a study session from submitted form values. @param values - Submitted values. @param seed - Session seed.
   * @param values - Submitted values.
   * @param seed - Session seed.
   */
  function startStudy(values: FormData, seed: string): void {
    const area = formValue(values, "area", "");
    const topic = formValue(values, "topic", "").trim().toLowerCase();
    const count = Number(formValue(values, "count", "10"));
    const candidates = payload.questions.filter((question) => matchesFilters(question, area, topic));
    if (candidates.length < count) { error.textContent = `Only ${candidates.length} questions match. Reduce the count or broaden the filter.`; return; }
    begin(newSession(mode, seed, selectQuestions(candidates, count, seed)));
  }

  /**
   * Handles setup form submission. @param event - Browser submit event.
   * @param event - Browser submit event.
   */
  function submitSetup(event: SubmitEvent): void {
    event.preventDefault();
    error.textContent = "";
    const values = new FormData(form);
    const seed = String(values.get("seed") ?? "").trim();
    if (!seed) { error.textContent = "Enter a session seed."; return; }
    const starters = { exam: startExam, study: startStudy };
    starters[mode](values, seed);
  }

  form.addEventListener("submit", submitSetup);

  /** Renders the active question and controls. */
  function renderQuestion(): void {
    if (!state) return;
    const item = presented[state.current]!;
    const question = item.question;
    const selected = state.answers[question.id];
    const answered = selected !== undefined;
    const isStudyRevealed = [mode === "study", answered].every(Boolean);
    const percent = Math.round(((state.current + 1) / presented.length) * 100);
    element<HTMLElement>("[data-progress-label]").textContent = `Question ${state.current + 1} of ${presented.length}`;
    element<HTMLElement>("[data-progress-percent]").textContent = `${percent}%`;
    element<HTMLElement>("[data-progress-bar]").style.width = `${percent}%`;
    element<HTMLElement>("[data-acs-code]").textContent = `${question.acsCode} · ${areaNames[question.area]}`;
    const prompt = element<HTMLElement>("[data-prompt]");
    prompt.textContent = question.prompt; prompt.tabIndex = -1;
    const choices = element<HTMLElement>("[data-choices]");
    choices.innerHTML = item.choices.map((choice, index) => choiceButton(choice, index, selected, item.correctIndex, isStudyRevealed)).join("");
    choices.querySelectorAll<HTMLButtonElement>("[data-choice]").forEach((button) => button.addEventListener("click", () => answer(Number(button.dataset.choice))));
    const flag = element<HTMLButtonElement>("[data-flag]");
    const flagged = state.flagged.includes(question.id);
    flag.setAttribute("aria-pressed", String(flagged));
    flag.textContent = { true: "Flagged for review", false: "Flag for review" }[String(flagged) as "true" | "false"];
    flag.classList.toggle("border-amber-500", flagged);
    flag.classList.toggle("bg-amber-50", flagged);
    renderFeedback(item, selected);
    element<HTMLButtonElement>("[data-previous]").disabled = state.current === 0;
    const final = String(state.current === presented.length - 1) as "true" | "false";
    element<HTMLButtonElement>("[data-next]").textContent = { true: "Finish session", false: "Next question" }[final];
    renderNavigator();
    save();
  }

  /**
   * Records a selected choice.
   * @param index - Presented choice index.
   */
  function answer(index: number): void {
    if (!state) return;
    const question = presented[state.current]!.question;
    if (answerLocked(mode, state.answers[question.id])) return;
    state.answers[question.id] = index;
    renderQuestion();
  }

  /**
   * Renders study-mode feedback.
   * @param item - Presented question.
   * @param selected - Selected choice index.
   */
  function renderFeedback(item: PresentedQuestion, selected?: number): void {
    const feedback = element<HTMLElement>("[data-feedback]");
    const view = feedbackView(item, selected, [mode === "study", selected !== undefined].every(Boolean));
    feedback.className = view.className;
    feedback.innerHTML = view.html;
  }

  /** Refreshes question navigation. */
  function renderNavigator(): void {
    if (!state) return;
    const answered = new Set(Object.keys(state.answers));
    const flagged = new Set(state.flagged);
    element<HTMLElement>("[data-navigator]").innerHTML = presented.map(({ question }, index) => navigatorButton(question, index, state!.current, answered, flagged)).join("");
    element<HTMLElement>("[data-navigator]").querySelectorAll<HTMLButtonElement>("[data-jump]").forEach((button) => button.addEventListener("click", () => navigate(Number(button.dataset.jump))));
  }

  /**
   * Moves to a question.
   * @param index - Target question index.
   */
  function navigate(index: number): void { if (!state) return; if (!validIndex(index, presented.length)) return; state.current = index; renderQuestion(); element<HTMLElement>("[data-prompt]").focus(); }

  /** Toggles the active question flag. */
  function toggleFlag(): void {
    if (!state) return;
    const id = presented[state.current]!.question.id;
    state.flagged = toggleQuestionFlag(state.flagged, id);
    renderQuestion();
  }

  /**
   * Completes and scores the session.
   * @param force - Skip the unanswered confirmation.
   */
  function finish(force: boolean): void {
    if (!state) return;
    if (cancelFinish(force, mode, Object.keys(state.answers).length, presented.length)) return;
    window.clearInterval(timer);
    const completed = state;
    const correct = correctAnswerCount(presented, completed.answers);
    const percent = scorePercent(correct, presented.length);
    const history: HistoryEntry[] = parseHistory(localStorage.getItem(historyKey));
    history.push(historyEntry(mode, completed, correct, presented.length, percent));
    localStorage.setItem(historyKey, JSON.stringify(history.slice(-50)));
    renderHistory();
    localStorage.removeItem(activeKey);
    sessionPanel.classList.add("hidden");
    resultsPanel.classList.remove("hidden");
    renderResults(completed, correct, percent);
    resultsPanel.focus();
  }

  /**
   * Renders the score and remediation.
   * @param completed - Completed session.
   * @param correct - Correct count.
   * @param percent - Score percentage.
   */
  function renderResults(completed: SessionState, correct: number, percent: number): void {
    element<HTMLElement>("[data-score-summary]").innerHTML = scoreSummary(mode, correct, presented.length, percent);
    element<HTMLElement>("[data-area-scores]").innerHTML = areaScores(presented, completed, areaNames);
    element<HTMLElement>("[data-review]").innerHTML = reviewHtml(presented, completed);
  }

  /** Starts the exam countdown. */
  function startTimer(): void {
    window.clearInterval(timer);
    const expiresAt = timerExpiry(mode, state);
    if (!expiresAt) return;
    const display = element<HTMLElement>("[data-timer]");
    /** Updates the visible timer and finishes an expired session. */
    const tick = () => {
      const remaining = Math.max(0, expiresAt - Date.now());
      display.textContent = formatRemaining(remaining);
      display.classList.toggle("bg-red-700", remaining <= 10 * 60_000);
      if (remaining === 0) finish(true);
    };
    tick();
    timer = window.setInterval(tick, 1000);
  }

  /** Opens the previous question. */
  function previousQuestion(): void { navigate(currentIndex(state) - 1); }
  /** Opens the next question or finishes the session. */
  function nextQuestion(): void {
    if (currentIndex(state) === presented.length - 1) { finish(false); return; }
    navigate(currentIndex(state) + 1);
  }
  /** Saves and exits the active session. */
  function exitSession(): void { save(); window.clearInterval(timer); sessionPanel.classList.add("hidden"); setupPanel.classList.remove("hidden"); resumeButton.classList.remove("hidden"); }
  /** Returns from results to setup. */
  function newSessionSetup(): void { resultsPanel.classList.add("hidden"); setupPanel.classList.remove("hidden"); state = undefined; }
  /** Clears saved history after confirmation. */
  function clearHistory(): void { if (!confirm("Clear locally saved quiz history?")) return; localStorage.removeItem(historyKey); renderHistory(); }
  /** Resumes a compatible saved session. */
  function resumeSession(): void { const active = readActive(); if (active) begin(active); }
  /**
   * Handles an enabled quiz keyboard shortcut.
   * @param event - Keyboard event.
   */
  function handleShortcut(event: KeyboardEvent): void {
    const blocked = [sessionPanel.classList.contains("hidden"), event.altKey, event.ctrlKey, event.metaKey].includes(true);
    if (blocked) return;
    const actions: Record<string, () => void> = { "1": answer.bind(undefined, 0), "2": answer.bind(undefined, 1), "3": answer.bind(undefined, 2), "4": answer.bind(undefined, 3), ArrowLeft: previousQuestion, ArrowRight: nextQuestion, f: toggleFlag, F: toggleFlag };
    actions[event.key]?.();
  }

  element<HTMLButtonElement>("[data-previous]").addEventListener("click", previousQuestion);
  element<HTMLButtonElement>("[data-next]").addEventListener("click", nextQuestion);
  element<HTMLButtonElement>("[data-flag]").addEventListener("click", toggleFlag);
  element<HTMLButtonElement>("[data-exit]").addEventListener("click", exitSession);
  element<HTMLButtonElement>("[data-new-session]").addEventListener("click", newSessionSetup);
  element<HTMLButtonElement>("[data-clear-history]").addEventListener("click", clearHistory);
  resumeButton.addEventListener("click", resumeSession);
  document.addEventListener("keydown", handleShortcut);

  if (readActive()) resumeButton.classList.remove("hidden");
  renderHistory();
}
