import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { auditComplianceCsv, auditComplianceFile, parseCsv } from "./compliance.js";

const header = "Item,Expiration/due date,Advance reminder,Responsible person,Status,Notes\n";

// eslint-disable-next-line max-lines-per-function -- Root suite groups function-level describes.
describe("compliance", () => {
describe("parseCsv and auditComplianceCsv", () => {
  it("should parse quoted CSV fields", () => {
    expect(parseCsv('a,"b,c"\n')).toEqual([["a", "b,c"]]);
    expect(parseCsv('"a""b",c\r\n\n')).toEqual([["a\"b", "c"]]);
    expect(parseCsv("a,b")).toEqual([["a", "b"]]);
    expect(parseCsv("a,")).toEqual([["a", ""]]);
  });

  it("should classify overdue, due-soon, current, and missing ownership", () => {
    const csv = header + [
      "Past,2026-01-01,30,Ada,Open,x",
      "Soon,2026-08-30,30,Ada,Open,x",
      "Later,2027-08-30,30,Ada,Open,x",
      "Ownerless,2027-08-30,30,,Open,x",
    ].join("\n");
    expect(auditComplianceCsv(csv, new Date("2026-08-23T00:00:00Z")).map(({ state }) => state))
      .toEqual(["overdue", "due-soon", "current", "missing"]);
  });

  it("should reject ambiguous dates", () => {
    expect(() => auditComplianceCsv(`${header}Bad,08/30/2026,30,Ada,Open,x`, new Date()))
      .toThrow(/YYYY-MM-DD/);
  });
});

describe("compliance audit edge cases", () => {
  it("should reject empty calendars and missing columns", () => {
    expect(() => auditComplianceCsv("", new Date())).toThrow(/empty/);
    expect(() => auditComplianceCsv("Item\nThing", new Date())).toThrow(/missing column/);
  });

  it("should handle undated records and default reminders", async () => {
    const directory = await mkdtemp(join(tmpdir(), "part107-"));
    const path = join(directory, "calendar.csv");
    await writeFile(path, `${header}Undated,,,Ada,Open,note\nLater,2026-09-30,,Ada,Open,note`);
    const findings = await auditComplianceFile(path, new Date("2026-08-23T00:00:00Z"));
    expect(findings.map(({ state }) => state)).toEqual(["not-dated", "current"]);
  });

  it("should label unnamed and truncated records as missing", () => {
    const csv = `${header},2027-01-01,30,Ada,Open,note\nTruncated`;
    const findings = auditComplianceCsv(csv, new Date("2026-08-23T00:00:00Z"));
    expect(findings.map(({ item, state }) => ({ item, state }))).toEqual([
      { item: "(unnamed)", state: "missing" },
      { item: "Truncated", state: "missing" },
    ]);
  });
});
});
