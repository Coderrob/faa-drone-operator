import { describe, expect, it } from "vitest";
import { selectMockForm } from "./mock-exams.js";
import { loadQuestions } from "./questions.js";

describe("mock-exams", () => {
  describe("selectMockForm", () => {
    it.each(["A", "B"])("loads form %s with 60 unique questions", (form) => {
      const selected = selectMockForm(form, loadQuestions());
      expect(selected).toHaveLength(60);
      expect(new Set(selected.map(({ id }) => id)).size).toBe(60);
    });

    it("should reject unknown forms", () => {
      expect(() => selectMockForm("Z", loadQuestions())).toThrow(/unknown mock form/);
    });

    it("should reject a known form when its questions are unavailable", () => {
      expect(() => selectMockForm("a", [])).toThrow(/references missing/);
    });
  });
});
