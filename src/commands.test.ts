import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runComplianceAudit, runStats, runValidate } from "./commands.js";
import type * as QuestionsModule from "./questions.js";

afterEach(() => vi.restoreAllMocks());

/**
 * Suppresses command output while retaining it for assertions.
 * @returns A spy for writes to standard output.
 */
function captureOutput() {
  return vi.spyOn(process.stdout, "write").mockImplementation(() => true);
}

// eslint-disable-next-line max-lines-per-function -- Root suite groups function-level describes.
describe("commands", () => {
  describe("runValidate", () => {
    it("should validate the canonical release collection", () => {
      const output = captureOutput();
      expect(runValidate()).toBe(0);
      expect(runValidate(true)).toBe(0);
      expect(output).toHaveBeenCalled();
    });
  });

  describe("CLI validation failures", () => {
    it("should print canonical validation errors", async () => {
      vi.resetModules();
      vi.doMock("./questions.js", async (importOriginal) => {
        const original = await importOriginal<typeof QuestionsModule>();
        return { ...original, validateQuestions: vi.fn(() => ["fixture error"]) };
      });
      const output = captureOutput();
      const { runValidate: validateFixture } = await import("./commands.js");
      expect(validateFixture()).toBe(1);
      expect(output).toHaveBeenCalledWith("ERROR: fixture error\n");
      vi.doUnmock("./questions.js");
    });
  });

  describe("runStats", () => {
    it("should print statistics for empty and populated history", async () => {
      const output = captureOutput();
      const directory = await mkdtemp(join(tmpdir(), "stats-"));
      expect(await runStats(join(directory, "missing.json"), new Date("2026-01-01"))).toBe(0);
      const history = join(directory, "history.json");
      await writeFile(
        history,
        JSON.stringify({
          version: 1,
          sessions: [
            {
              id: "s",
              mode: "study",
              startedAt: "2026-01-01T00:00:00Z",
              completedAt: "2026-01-01T00:00:00Z",
              seed: "s",
              answers: [{ questionId: "Q", acsCode: "UA.I.A.K1", selectedIndex: 0, correct: true }],
            },
          ],
        }),
      );
      expect(await runStats(history, new Date("2027-01-01"))).toBe(0);
      expect(output).toHaveBeenCalledWith(expect.stringContaining("Correct: 100%"));
    });
  });

  describe("runComplianceAudit", () => {
    it("should print human and JSON compliance findings and exit states", async () => {
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
});
