import { describe, expect, it } from "vitest";
import { dueQuestionIds } from "../src/history.js";
import type { HistoryFile } from "../src/types.js";

function history(correct: boolean, completedAt: string): HistoryFile {
  return { version: 1, sessions: [{ id: "s", mode: "study", seed: "x", startedAt: completedAt, completedAt, answers: [{ questionId: "Q", acsCode: "UA.I.A.K1", selectedIndex: 0, correct }] }] };
}

describe("spaced review", () => {
  it("schedules an incorrect answer after one day", () => {
    expect(dueQuestionIds(history(false, "2026-08-20T00:00:00Z"), new Date("2026-08-21T00:00:00Z"))).toEqual(new Set(["Q"]));
  });

  it("schedules a first correct answer after three days", () => {
    const source = history(true, "2026-08-20T00:00:00Z");
    expect(dueQuestionIds(source, new Date("2026-08-22T00:00:00Z"))).toEqual(new Set());
    expect(dueQuestionIds(source, new Date("2026-08-23T00:00:00Z"))).toEqual(new Set(["Q"]));
  });
});
