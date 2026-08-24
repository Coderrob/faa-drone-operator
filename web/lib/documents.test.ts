import { describe, expect, it } from "vitest";
import { getDocument, getDocuments, renderDocument, rewriteLinks } from "./documents";

// eslint-disable-next-line max-lines-per-function -- Root suite groups function-level describes.
describe("documents", () => {
describe("getDocuments, getDocument, renderDocument, and rewriteLinks", () => {
  it("should return a fresh ordered catalog and resolve slugs", () => {
    const first = getDocuments();
    const second = getDocuments();
    expect(first).not.toBe(second);
    expect(first.map(({ order }) => order)).toEqual([...first].map(({ order }) => order).sort((a, b) => a - b));
    expect(getDocument("certification-roadmap")?.file).toBe("docs/01-certification-roadmap.md");
    expect(getDocument("missing")).toBeUndefined();
  });

  it("should render Markdown while removing its first heading", () => {
    const entry = getDocument("certification-roadmap")!;
    const html = renderDocument(entry);
    expect(html).not.toContain("<h1>Certification Roadmap");
    expect(html).toContain("<h2");
  });

  it("should rewrite document and repository-relative links", () => {
    expect(renderDocument(getDocument("sop-overview")!)).toContain('href="/learn/sop-photography/"');
    expect(renderDocument(getDocument("review-process")!)).toContain("github.com/Coderrob/faa-drone-operator/blob/main/study/review-log.csv");
  });

  it("should preserve fragments and links outside the repository", () => {
    expect(rewriteLinks("[guide](01-certification-roadmap.md#apply)", "docs/index.md"))
      .toContain("/learn/certification-roadmap/#apply");
    expect(rewriteLinks("[outside](../../outside.md)", "docs/index.md"))
      .toBe("[outside](../../outside.md)");
  });
});
});
