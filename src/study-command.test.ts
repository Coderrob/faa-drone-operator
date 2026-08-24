import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { filterQuestions, loadQuestions } from "./questions.js";
import { presentQuestion, selectQuestions } from "./quiz.js";
import type { StudyOptions } from "./study-command.js";

const reader = vi.hoisted(() => ({ question: vi.fn(async () => "S"), close: vi.fn() }));
vi.mock("node:readline/promises", () => ({ createInterface: vi.fn(() => reader) }));

afterEach(() => vi.restoreAllMocks());
beforeEach(() => {
  vi.spyOn(process.stdout, "write").mockImplementation(() => true);
});

const baseOptions: StudyOptions = {
  count: 1, seed: "coverage", answers: "S",
  history: "unused-history.json", noSave: true,
};

describe("interactive study command", () => {
  it("should prompt for an answer and always close its reader", async () => {
    const { runStudy } = await import("./study-command.js");
    expect(await runStudy({ count: 1, seed: "interactive", history: "unused.json", noSave: true })).toBe(2);
    expect(reader.question).toHaveBeenCalled();
    expect(reader.close).toHaveBeenCalled();
  });
});

describe("study command filters", () => {
  it("should reject conflicting and invalid filters", async () => {
    const { runStudy } = await import("./study-command.js");
    await expect(runStudy({ ...baseOptions, form: "A", area: "I" })).rejects.toThrow(/cannot be combined/);
    await expect(runStudy({ ...baseOptions, remediate: true, due: true })).rejects.toThrow(/either/);
    await expect(runStudy({ ...baseOptions, area: "VI" })).rejects.toThrow(/area must/);
    await expect(runStudy({ ...baseOptions, today: "not-a-date" })).rejects.toThrow(/YYYY-MM-DD/);
    await expect(runStudy({ ...baseOptions, topic: "no such topic exists" })).rejects.toThrow(/no questions/);
  });
});

describe("study command sessions", () => {
  it("should run supplied-answer study and exam sessions", async () => {
    const { runStudy } = await import("./study-command.js");
    const pool = filterQuestions(loadQuestions(), { area: "I", topic: "registration" });
    const selected = selectQuestions(pool, 1, baseOptions.seed)[0]!;
    const letter = String.fromCharCode(65 + presentQuestion(selected, baseOptions.seed).correctIndex);
    expect(await runStudy({ ...baseOptions, area: "i", topic: "registration", answers: letter })).toBe(0);
    expect([0, 2]).toContain(await runStudy({ ...baseOptions, form: "a", mode: "exam" }));
  });

  it("should persist sessions and select review pools", async () => {
    const { runStudy } = await import("./study-command.js");
    const history = join(await mkdtemp(join(tmpdir(), "commands-")), "history.json");
    await runStudy({ ...baseOptions, history, noSave: false });
    expect([0, 2]).toContain(await runStudy({ ...baseOptions, history, remediate: true }));
    await expect(runStudy({ ...baseOptions, history, due: true, today: "2000-01-01" })).rejects.toThrow(/no questions/);
  });
});
