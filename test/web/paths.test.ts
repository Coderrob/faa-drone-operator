import { describe, expect, it } from "vitest";
import { repositoryUrl, sitePath } from "../../web/lib/paths";

describe("site paths", () => {
  it("normalizes root-relative and relative routes", () => {
    expect(sitePath("/learn/")).toBe("/learn/");
    expect(sitePath("learn/")).toBe("/learn/");
    expect(sitePath()).toBe("/");
  });

  it("publishes the canonical repository URL", () => {
    expect(repositoryUrl).toBe("https://github.com/Coderrob/faa-drone-operator");
  });
});
