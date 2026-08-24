import { describe, expect, it } from "vitest";
import { selectMockForm } from "../src/mock-exams.js";
import { loadQuestions } from "../src/questions.js";

describe("fixed mock forms", () => {
  it.each(["A", "B"])("loads form %s with 60 unique questions", (form) => {
    const selected = selectMockForm(form, loadQuestions());
    expect(selected).toHaveLength(60);
    expect(new Set(selected.map(({ id }) => id)).size).toBe(60);
  });

  it("rejects unknown forms", () => {
    expect(() => selectMockForm("Z", loadQuestions())).toThrow(/unknown mock form/);
  });

  it("rejects a known form when its questions are unavailable", () => {
    expect(() => selectMockForm("a", [])).toThrow(/references missing/);
  });
});
