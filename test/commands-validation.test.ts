import { describe, expect, it, vi } from "vitest";

vi.mock("../src/questions.js", async (importOriginal) => {
  const original = await importOriginal<typeof import("../src/questions.js")>();
  return { ...original, validateQuestions: vi.fn(() => ["fixture error"]) };
});

describe("validation command failure", () => {
  it("prints validation errors and returns failure", async () => {
    const output = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const { runValidate } = await import("../src/commands.js");
    expect(runValidate()).toBe(1);
    expect(output).toHaveBeenCalledWith("ERROR: fixture error\n");
  });
});
