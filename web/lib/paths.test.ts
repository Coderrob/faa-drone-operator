import { describe, expect, it } from "vitest";
import { repositoryUrl, sitePath } from "./paths";

describe("paths", () => {
  describe("sitePath and repositoryUrl", () => {
    it("should normalize root-relative and relative routes", () => {
      expect(sitePath("/learn/")).toBe("/learn/");
      expect(sitePath("learn/")).toBe("/learn/");
      expect(sitePath()).toBe("/");
    });

    it("should publish the canonical repository URL", () => {
      expect(repositoryUrl).toBe("https://github.com/Coderrob/faa-drone-operator");
    });
  });
});
