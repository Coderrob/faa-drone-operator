import { afterEach, describe, expect, it, vi } from "vitest";
import { answerLocked, cancelFinish, currentIndex, formValue, historyEntry, matchesFilters, newSession, timerExpiry, validIndex } from "./quiz-controller";
import type { Question } from "../../src/types";

const question = { id: "q1", area: "I", topic: "Rules" } as Question;

afterEach(() => vi.unstubAllGlobals());

// eslint-disable-next-line max-lines-per-function -- Root suite groups function-level describes.
describe("quiz-controller", () => {
  describe("matchesFilters, newSession, and session controls", () => {
    it("should filter questions", () => {
      expect(matchesFilters(question, "", "")).toBe(true);
      expect(matchesFilters(question, "I", "rule")).toBe(true);
      expect(matchesFilters(question, "II", "rule")).toBe(false);
      expect(matchesFilters(question, "I", "weather")).toBe(false);
    });

    it("should build study and exam sessions", () => {
      expect(newSession("study", "s", [question]).questionIds).toEqual(["q1"]);
      expect(newSession("exam", "s", [question], { form: "A", expiresAt: 10 }).form).toBe("A");
    });

    it("should evaluate session controls", () => {
      expect(answerLocked("study", 1)).toBe(true);
      expect(answerLocked("exam", 1)).toBe(false);
      expect(validIndex(0, 1)).toBe(true);
      expect(validIndex(-1, 1)).toBe(false);
    });
  });

  describe("quiz controller browser values", () => {
    it("should read values and timer state", () => {
      const data = new FormData();
      data.set("field", "value");
      expect(formValue(data, "field", "fallback")).toBe("value");
      expect(formValue(data, "missing", "fallback")).toBe("fallback");
      const exam = newSession("exam", "s", [question], { form: "A", expiresAt: 10 });
      expect(timerExpiry("exam", exam)).toBe(10);
      expect(timerExpiry("exam", { ...exam, expiresAt: undefined } as never)).toBeUndefined();
      expect(timerExpiry("study", exam)).toBeUndefined();
      expect(currentIndex(undefined)).toBe(0);
      expect(currentIndex({ ...exam, current: 2 })).toBe(2);
    });
  });

  describe("quiz completion utilities", () => {
    it("should confirm only incomplete exams", () => {
      vi.stubGlobal(
        "confirm",
        vi.fn(() => false),
      );
      expect(cancelFinish(false, "exam", 0, 1)).toBe(true);
      vi.stubGlobal(
        "confirm",
        vi.fn(() => true),
      );
      expect(cancelFinish(false, "exam", 0, 1)).toBe(false);
      expect(cancelFinish(true, "exam", 0, 1)).toBe(false);
    });

    it("should build history with optional form", () => {
      const study = newSession("study", "s", [question]);
      const exam = newSession("exam", "s", [question], { form: "A", expiresAt: 10 });
      expect(historyEntry("study", study, 1, 1, 100).form).toBeUndefined();
      expect(historyEntry("exam", exam, 1, 1, 100).form).toBe("A");
    });
  });
});
