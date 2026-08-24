import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { appendSession, dueQuestionIds, readHistory, remediationIds } from "./history.js";
import type { HistoryFile } from "./types.js";

/**
 * Creates a minimal history fixture for spaced-review tests.
 *
 * @param correct - Whether the fixture answer was correct.
 * @param completedAt - ISO timestamp for the fixture session.
 * @returns A valid history file containing one completed answer.
 */
function history(correct: boolean, completedAt: string): HistoryFile {
  return { version: 1, sessions: [{ id: "s", mode: "study", seed: "x", startedAt: completedAt, completedAt, answers: [{ questionId: "Q", acsCode: "UA.I.A.K1", selectedIndex: 0, correct }] }] };
}

describe("spaced review", () => {
  it("should schedule an incorrect answer after one day", () => {
    expect(dueQuestionIds(history(false, "2026-08-20T00:00:00Z"), new Date("2026-08-21T00:00:00Z"))).toEqual(new Set(["Q"]));
  });

  it("should schedule a first correct answer after three days", () => {
    const source = history(true, "2026-08-20T00:00:00Z");
    expect(dueQuestionIds(source, new Date("2026-08-22T00:00:00Z"))).toEqual(new Set());
    expect(dueQuestionIds(source, new Date("2026-08-23T00:00:00Z"))).toEqual(new Set(["Q"]));
  });

  it("should cap mature correct streaks at the thirty-day interval", () => {
    const completedAt = "2026-01-01T00:00:00Z";
    const session = history(true, completedAt).sessions[0]!;
    const source: HistoryFile = { version: 1, sessions: Array.from({ length: 6 }, () => session) };
    expect(dueQuestionIds(source, new Date("2026-01-30T00:00:00Z"))).toEqual(new Set());
    expect(dueQuestionIds(source, new Date("2026-01-31T00:00:00Z"))).toEqual(new Set(["Q"]));
  });
});

describe("spaced review persistence", () => {
  it("should advance through intermediate correct-review intervals", () => {
    const completedAt = "2026-01-01T00:00:00Z";
    const session = history(true, completedAt).sessions[0]!;
    for (const [streak, day] of [[2, 8], [3, 15], [4, 31]] as const) {
      const source: HistoryFile = { version: 1, sessions: Array.from({ length: streak }, () => session) };
      expect(dueQuestionIds(source, new Date(`2026-01-${String(day).padStart(2, "0")}T00:00:00Z`))).toEqual(new Set(["Q"]));
    }
  });

  it("should read missing history and persist appended sessions", async () => {
    const directory = await mkdtemp(join(tmpdir(), "part107-"));
    const path = join(directory, "nested", "history.json");
    expect(await readHistory(path)).toEqual({ version: 1, sessions: [] });
    const session = history(false, "2026-08-20T00:00:00Z").sessions[0]!;
    await appendSession(path, session);
    expect(JSON.parse(await readFile(path, "utf8")).sessions).toHaveLength(1);
  });

  it("should reject unsupported history and track latest remediation state", async () => {
    const directory = await mkdtemp(join(tmpdir(), "part107-"));
    const path = join(directory, "history.json");
    await writeFile(path, '{"version":2,"sessions":[]}');
    await expect(readHistory(path)).rejects.toThrow(/unsupported/);
    const source = history(false, "invalid");
    expect(remediationIds(source)).toEqual(new Set(["Q"]));
    expect(dueQuestionIds(source, new Date())).toEqual(new Set());
  });
});
