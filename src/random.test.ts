import { describe, expect, it } from "vitest";
import { seededRandom, shuffled } from "./random.js";

describe("random", () => {
describe("seededRandom and shuffled", () => {
  it("should be deterministic for the same seed", () => {
    expect(shuffled([1, 2, 3, 4, 5], seededRandom("same"))).toEqual(
      shuffled([1, 2, 3, 4, 5], seededRandom("same")),
    );
  });

  it("should not mutate input", () => {
    const input = [1, 2, 3];
    shuffled(input, seededRandom("seed"));
    expect(input).toEqual([1, 2, 3]);
  });
});
});
