import { describe, expect, it } from "vitest";
import { getDocument, getDocuments, renderDocument, rewriteLinks } from "../../web/lib/documents";

describe("learning documents", () => {
  it("returns a fresh ordered catalog and resolves slugs", () => {
    const first = getDocuments();
    const second = getDocuments();
    expect(first).not.toBe(second);
    expect(first.map(({ order }) => order)).toEqual([...first].map(({ order }) => order).sort((a, b) => a - b));
    expect(getDocument("certification-roadmap")?.file).toBe("docs/01-certification-roadmap.md");
    expect(getDocument("missing")).toBeUndefined();
  });

  it("renders Markdown while removing its first heading", () => {
    const entry = getDocument("certification-roadmap")!;
    const html = renderDocument(entry);
    expect(html).not.toContain("<h1>Certification Roadmap");
    expect(html).toContain("<h2");
  });

  it("rewrites document and repository-relative links", () => {
    expect(renderDocument(getDocument("sop-overview")!)).toContain('href="/learn/sop-photography/"');
    expect(renderDocument(getDocument("review-process")!)).toContain("github.com/Coderrob/faa-drone-operator/blob/main/study/review-log.csv");
  });

  it("preserves fragments and links outside the repository", () => {
    expect(rewriteLinks("[guide](01-certification-roadmap.md#apply)", "docs/index.md"))
      .toContain("/learn/certification-roadmap/#apply");
    expect(rewriteLinks("[outside](../../outside.md)", "docs/index.md"))
      .toBe("[outside](../../outside.md)");
  });
});
