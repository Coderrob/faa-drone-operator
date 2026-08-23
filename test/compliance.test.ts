import { describe, expect, it } from "vitest";
import { auditComplianceCsv, parseCsv } from "../src/compliance.js";

const header = "Item,Expiration/due date,Advance reminder,Responsible person,Status,Notes\n";

describe("compliance audit", () => {
  it("parses quoted CSV fields", () => {
    expect(parseCsv('a,"b,c"\n')).toEqual([["a", "b,c"]]);
  });

  it("classifies overdue, due-soon, current, and missing ownership", () => {
    const csv = header + [
      "Past,2026-01-01,30,Ada,Open,x",
      "Soon,2026-08-30,30,Ada,Open,x",
      "Later,2027-08-30,30,Ada,Open,x",
      "Ownerless,2027-08-30,30,,Open,x",
    ].join("\n");
    expect(auditComplianceCsv(csv, new Date("2026-08-23T00:00:00Z")).map(({ state }) => state))
      .toEqual(["overdue", "due-soon", "current", "missing"]);
  });

  it("rejects ambiguous dates", () => {
    expect(() => auditComplianceCsv(`${header}Bad,08/30/2026,30,Ada,Open,x`, new Date()))
      .toThrow(/YYYY-MM-DD/);
  });
});
