import { beforeEach, describe, expect, it, vi } from "vitest";

const reader = vi.hoisted(() => ({ question: vi.fn(async () => "S"), close: vi.fn() }));
vi.mock("node:readline/promises", () => ({ createInterface: vi.fn(() => reader) }));

describe("interactive study command", () => {
  beforeEach(() => {
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  it("prompts for an answer and always closes its reader", async () => {
    const { runStudy } = await import("../src/commands.js");
    expect(await runStudy({ count: 1, seed: "interactive", history: "unused.json", noSave: true })).toBe(2);
    expect(reader.question).toHaveBeenCalled();
    expect(reader.close).toHaveBeenCalled();
  });
});
