import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runComplianceAudit, runStats, runStudy, runValidate, type StudyOptions } from "../src/commands.js";
import { filterQuestions, loadQuestions } from "../src/questions.js";
import { presentQuestion, selectQuestions } from "../src/quiz.js";

const baseOptions: StudyOptions = {
  count: 1,
  seed: "coverage",
  answers: "S",
  history: "unused-history.json",
  noSave: true,
};

afterEach(() => vi.restoreAllMocks());

/**
 * Suppresses command output while retaining it for assertions.
 * @returns A spy for writes to standard output.
 */
function captureOutput() {
  return vi.spyOn(process.stdout, "write").mockImplementation(() => true);
}

describe("CLI command handlers", () => {
  it("validates the canonical release collection", () => {
    const output = captureOutput();
    expect(runValidate()).toBe(0);
    expect(runValidate(true)).toBe(0);
    expect(output).toHaveBeenCalled();
  });

  it("rejects conflicting and invalid study filters", async () => {
    await expect(runStudy({ ...baseOptions, form: "A", area: "I" })).rejects.toThrow(/cannot be combined/);
    await expect(runStudy({ ...baseOptions, remediate: true, due: true })).rejects.toThrow(/either/);
    await expect(runStudy({ ...baseOptions, area: "VI" })).rejects.toThrow(/area must/);
    await expect(runStudy({ ...baseOptions, today: "not-a-date" })).rejects.toThrow(/YYYY-MM-DD/);
    await expect(runStudy({ ...baseOptions, topic: "no such topic exists" })).rejects.toThrow(/no questions/);
  });
});

describe("CLI study command handlers", () => {
  it("runs supplied-answer study and exam sessions", async () => {
    captureOutput();
    const pool = filterQuestions(loadQuestions(), { area: "I", topic: "registration" });
    const selected = selectQuestions(pool, 1, baseOptions.seed)[0]!;
    const letter = String.fromCharCode(65 + presentQuestion(selected, baseOptions.seed).correctIndex);
    expect(await runStudy({ ...baseOptions, area: "i", topic: "registration", answers: letter })).toBe(0);
    expect([0, 2]).toContain(await runStudy({ ...baseOptions, form: "a", mode: "exam" }));
  });

  it("persists sessions and selects remediation and due pools", async () => {
    captureOutput();
    const directory = await mkdtemp(join(tmpdir(), "commands-"));
    const history = join(directory, "history.json");
    await runStudy({ ...baseOptions, history, noSave: false });
    expect([0, 2]).toContain(await runStudy({ ...baseOptions, history, remediate: true }));
    await expect(runStudy({ ...baseOptions, history, due: true, today: "2000-01-01" })).rejects.toThrow(/no questions/);
  });
});

describe("CLI reporting command handlers", () => {
  it("prints statistics for empty and populated history", async () => {
    const output = captureOutput();
    const directory = await mkdtemp(join(tmpdir(), "stats-"));
    expect(await runStats(join(directory, "missing.json"), new Date("2026-01-01"))).toBe(0);
    const history = join(directory, "history.json");
    await writeFile(history, JSON.stringify({ version: 1, sessions: [{ id: "s", mode: "study", startedAt: "2026-01-01T00:00:00Z", completedAt: "2026-01-01T00:00:00Z", seed: "s", answers: [{ questionId: "Q", acsCode: "UA.I.A.K1", selectedIndex: 0, correct: true }] }] }));
    expect(await runStats(history, new Date("2027-01-01"))).toBe(0);
    expect(output).toHaveBeenCalledWith(expect.stringContaining("Correct: 100%"));
  });

  it("prints human and JSON compliance findings and exit states", async () => {
    const output = captureOutput();
    const directory = await mkdtemp(join(tmpdir(), "audit-"));
    const path = join(directory, "calendar.csv");
    const header = "Item,Expiration/due date,Advance reminder,Responsible person,Status,Notes\n";
    await writeFile(path, `${header}Current,2027-01-01,30,Ada,Open,x\n`);
    expect(await runComplianceAudit(path, "2026-01-01", false)).toBe(0);
    expect(await runComplianceAudit(path)).toBe(0);
    expect(await runComplianceAudit(path, "2028-01-01", true)).toBe(3);
    await writeFile(path, `${header}Ownerless,,,,Open,x\n`);
    expect(await runComplianceAudit(path, "2026-01-01", false)).toBe(3);
    await expect(runComplianceAudit(path, "invalid")).rejects.toThrow(/YYYY-MM-DD/);
    expect(output).toHaveBeenCalled();
  });
});
