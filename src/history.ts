import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { HistoryFile, SessionRecord } from "./types.js";

const EMPTY_HISTORY: HistoryFile = { version: 1, sessions: [] };

export async function readHistory(path: string): Promise<HistoryFile> {
  try {
    const content = await readFile(path, "utf8");
    const parsed = JSON.parse(content) as HistoryFile;
    if (parsed.version !== 1 || !Array.isArray(parsed.sessions)) throw new Error("unsupported history format");
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return EMPTY_HISTORY;
    throw error;
  }
}

export async function appendSession(path: string, session: SessionRecord): Promise<void> {
  const history = await readHistory(path);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify({ version: 1, sessions: [...history.sessions, session] }, null, 2)}\n`, "utf8");
}

export function remediationIds(history: HistoryFile): Set<string> {
  const latest = new Map<string, boolean>();
  for (const session of history.sessions) {
    for (const answer of session.answers) latest.set(answer.questionId, answer.correct);
  }
  return new Set([...latest].filter(([, correct]) => !correct).map(([id]) => id));
}

export function dueQuestionIds(history: HistoryFile, now: Date): Set<string> {
  const state = new Map<string, { streak: number; reviewedAt: number }>();
  for (const session of history.sessions) {
    const reviewedAt = Date.parse(session.completedAt);
    if (!Number.isFinite(reviewedAt)) continue;
    for (const answer of session.answers) {
      const previous = state.get(answer.questionId);
      state.set(answer.questionId, {
        streak: answer.correct ? (previous?.streak ?? 0) + 1 : 0,
        reviewedAt,
      });
    }
  }
  const correctIntervals = [3, 7, 14, 30];
  const due = new Set<string>();
  for (const [questionId, record] of state) {
    const days = record.streak === 0
      ? 1
      : correctIntervals[Math.min(record.streak, correctIntervals.length) - 1]!;
    if (now.getTime() >= record.reviewedAt + days * 86_400_000) due.add(questionId);
  }
  return due;
}
