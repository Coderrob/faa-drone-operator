import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { appendSession, dueQuestionIds, readHistory, remediationIds } from "./history.js";
import { filterQuestions, loadQuestions, validateQuestions } from "./questions.js";
import { parseAnswer, presentQuestion, selectQuestions } from "./quiz.js";
import { selectMockForm } from "./mock-exams.js";
import type { AcsArea, AnswerResult, Question, SessionRecord } from "./types.js";
import { auditComplianceFile } from "./compliance.js";

export interface StudyOptions {
  readonly count: number;
  readonly area?: string;
  readonly topic?: string;
  readonly seed: string;
  readonly answers?: string;
  readonly history: string;
  readonly remediate?: boolean;
  readonly due?: boolean;
  readonly today?: string;
  readonly noSave?: boolean;
  readonly mode?: "study" | "exam";
  readonly form?: string;
}

function normalizedArea(value?: string): AcsArea | undefined {
  if (value === undefined) return undefined;
  const normalized = value.toUpperCase();
  if (!["I", "II", "III", "IV", "V"].includes(normalized)) {
    throw new Error("area must be I, II, III, IV, or V");
  }
  return normalized as AcsArea;
}

function printExplanation(question: Question, correct: boolean): void {
  output.write(`${correct ? "Correct" : "Incorrect"}: ${question.explanation}\n`);
  output.write(`Remediation: ${question.remediation}\n`);
  for (const citation of question.citations) {
    output.write(`Source: ${citation.label}, ${citation.locator} — ${citation.url}\n`);
  }
}

export async function runStudy(options: StudyOptions): Promise<number> {
  const history = await readHistory(options.history);
  if (options.form !== undefined &&
      (options.area !== undefined || options.topic !== undefined || options.remediate === true || options.due === true)) {
    throw new Error("--form cannot be combined with --area, --topic, --remediate, or --due");
  }
  if (options.remediate === true && options.due === true) {
    throw new Error("choose either --remediate or --due");
  }
  const reviewDate = options.today === undefined ? new Date() : new Date(`${options.today}T00:00:00Z`);
  if (Number.isNaN(reviewDate.getTime())) throw new Error("--today must be YYYY-MM-DD");
  const dueIds = options.remediate === true
    ? remediationIds(history)
    : options.due === true
      ? dueQuestionIds(history, reviewDate)
      : undefined;
  const area = normalizedArea(options.area);
  const pool = filterQuestions(loadQuestions(), {
    ...(area === undefined ? {} : { area }),
    ...(options.topic === undefined ? {} : { topic: options.topic }),
    ...(dueIds === undefined ? {} : { dueIds }),
  });
  if (pool.length === 0) throw new Error("no questions match the requested filters");

  const selected = options.form === undefined
    ? selectQuestions(pool, options.count, options.seed)
    : selectMockForm(options.form, loadQuestions());
  const suppliedAnswers = options.answers?.split(",") ?? [];
  const interactive = options.answers === undefined;
  const reader = interactive ? createInterface({ input, output }) : undefined;
  const answers: AnswerResult[] = [];
  const startedAt = new Date().toISOString();

  try {
    for (const [index, question] of selected.entries()) {
      const presented = presentQuestion(question, options.seed);
      output.write(`\n${index + 1}/${selected.length} [${question.acsCode}] ${question.prompt}\n`);
      presented.choices.forEach((choice, choiceIndex) => {
        output.write(`  ${String.fromCharCode(65 + choiceIndex)}. ${choice}\n`);
      });
      const raw = interactive
        ? await reader!.question("Answer (A-D or S to skip): ")
        : (suppliedAnswers[index] ?? "S");
      const selectedIndex = parseAnswer(raw, presented.choices.length);
      const correct = selectedIndex === presented.correctIndex;
      answers.push({ questionId: question.id, acsCode: question.acsCode, selectedIndex, correct });
      if (options.mode !== "exam") printExplanation(question, correct);
    }
  } finally {
    reader?.close();
  }

  const correctCount = answers.filter(({ correct }) => correct).length;
  const percent = Math.round((correctCount / answers.length) * 100);
  output.write(`\nScore: ${correctCount}/${answers.length} (${percent}%)\n`);
  if (options.mode === "exam") {
    for (const [index, question] of selected.entries()) printExplanation(question, answers[index]!.correct);
  }

  const session: SessionRecord = {
    id: `${startedAt}-${options.seed}`,
    mode: options.mode ?? "study",
    startedAt,
    completedAt: new Date().toISOString(),
    seed: options.seed,
    answers,
  };
  if (options.noSave !== true) await appendSession(options.history, session);
  return percent >= 70 ? 0 : 2;
}

export function runValidate(release = false): number {
  const questions = loadQuestions();
  const errors = validateQuestions(questions);
  if (release) {
    for (const question of questions) {
      if (question.id.startsWith("CARD-") && question.distractorReview !== "approved") {
        errors.push(`${question.id}: distractors are not approved for release`);
      }
    }
  }
  if (errors.length > 0) {
    errors.forEach((error) => output.write(`ERROR: ${error}\n`));
    return 1;
  }
  const areas = new Set(questions.map(({ area }) => area));
  output.write(`PASS: ${questions.length} questions valid across ${areas.size} ACS Areas${release ? " and approved for release" : ""}.\n`);
  return 0;
}

export async function runStats(historyPath: string, today = new Date()): Promise<number> {
  const history = await readHistory(historyPath);
  const answers = history.sessions.flatMap(({ answers: sessionAnswers }) => sessionAnswers);
  const correct = answers.filter((answer) => answer.correct).length;
  output.write(`Sessions: ${history.sessions.length}\nAnswers: ${answers.length}\n`);
  output.write(`Correct: ${answers.length === 0 ? 0 : Math.round((correct / answers.length) * 100)}%\n`);
  output.write(`Due for remediation: ${remediationIds(history).size}\n`);
  output.write(`Due for spaced review: ${dueQuestionIds(history, today).size}\n`);
  return 0;
}

export async function runComplianceAudit(
  path: string,
  todayText?: string,
  json = false,
): Promise<number> {
  const today = todayText === undefined ? new Date() : new Date(`${todayText}T00:00:00Z`);
  if (Number.isNaN(today.getTime())) throw new Error("--today must be YYYY-MM-DD");
  const findings = await auditComplianceFile(path, today);
  if (json) output.write(`${JSON.stringify(findings, null, 2)}\n`);
  else {
    for (const finding of findings) {
      const remaining = finding.daysRemaining === null ? "n/a" : `${finding.daysRemaining}d`;
      output.write(`${finding.state.padEnd(9)} ${remaining.padStart(6)}  ${finding.item}  owner=${finding.responsiblePerson || "MISSING"}\n`);
    }
    const counts = new Map<string, number>();
    findings.forEach(({ state }) => counts.set(state, (counts.get(state) ?? 0) + 1));
    output.write(`Summary: ${[...counts].map(([state, count]) => `${state}=${count}`).join(" ")}\n`);
  }
  return findings.some(({ state }) => state === "overdue" || state === "missing") ? 3 : 0;
}
