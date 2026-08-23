import { readFile } from "node:fs/promises";

export type ComplianceState = "overdue" | "due-soon" | "current" | "missing" | "not-dated";

export interface ComplianceFinding {
  readonly item: string;
  readonly responsiblePerson: string;
  readonly dueDate: string;
  readonly daysRemaining: number | null;
  readonly state: ComplianceState;
  readonly notes: string;
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]!;
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(field); field = ""; }
    else if (character === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += character;
  }
  if (field.length > 0 || row.length > 0) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  return rows.filter((values) => values.some((value) => value.trim().length > 0));
}

export function auditComplianceCsv(text: string, today: Date): ComplianceFinding[] {
  const rows = parseCsv(text);
  const headers = rows.shift();
  if (headers === undefined) throw new Error("compliance calendar is empty");
  const index = new Map(headers.map((header, position) => [header.trim(), position]));
  for (const required of ["Item", "Expiration/due date", "Advance reminder", "Responsible person", "Status", "Notes"]) {
    if (!index.has(required)) throw new Error(`compliance calendar missing column: ${required}`);
  }
  const value = (row: string[], header: string): string => row[index.get(header)!]?.trim() ?? "";
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return rows.map((row) => {
    const item = value(row, "Item");
    const dueDate = value(row, "Expiration/due date");
    const reminderText = value(row, "Advance reminder");
    const requiredMissing = item === "" || value(row, "Responsible person") === "" || value(row, "Status") === "";
    if (requiredMissing) return { item: item || "(unnamed)", responsiblePerson: value(row, "Responsible person"), dueDate, daysRemaining: null, state: "missing", notes: value(row, "Notes") };
    if (dueDate === "") return { item, responsiblePerson: value(row, "Responsible person"), dueDate, daysRemaining: null, state: "not-dated", notes: value(row, "Notes") };
    const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dueDate);
    if (parsed === null) throw new Error(`${item}: due date must be YYYY-MM-DD`);
    const due = Date.UTC(Number(parsed[1]), Number(parsed[2]) - 1, Number(parsed[3]));
    const daysRemaining = Math.floor((due - start) / 86_400_000);
    const reminder = Number.parseInt(reminderText, 10);
    const reminderDays = Number.isFinite(reminder) ? reminder : 30;
    const state: ComplianceState = daysRemaining < 0 ? "overdue" : daysRemaining <= reminderDays ? "due-soon" : "current";
    return { item, responsiblePerson: value(row, "Responsible person"), dueDate, daysRemaining, state, notes: value(row, "Notes") };
  });
}

export async function auditComplianceFile(path: string, today: Date): Promise<ComplianceFinding[]> {
  return auditComplianceCsv(await readFile(path, "utf8"), today);
}
