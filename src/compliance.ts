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
type CsvValue = (row: string[], header: string) => string;

/**
 * Classifies a number of days remaining against a reminder threshold.
 * @param daysRemaining - Whole days until the due date.
 * @param reminderDays - Advance-warning threshold.
 * @returns The applicable compliance state.
 */
function classifyDate(daysRemaining: number, reminderDays: number): ComplianceState {
  if (daysRemaining < 0) return "overdue";
  return daysRemaining <= reminderDays ? "due-soon" : "current";
}

/**
 * Converts one calendar row into a normalized finding.
 * @param row - CSV field values.
 * @param value - Header-aware value accessor.
 * @param start - Audit date as UTC epoch milliseconds.
 * @returns The normalized finding.
 * @throws {Error} When a populated due date is not ISO formatted.
 */
function auditRow(row: string[], value: CsvValue, start: number): ComplianceFinding {
  const item = value(row, "Item");
  const responsiblePerson = value(row, "Responsible person");
  const dueDate = value(row, "Expiration/due date");
  const base = { item: displayItem(item), responsiblePerson, dueDate, notes: value(row, "Notes") };
  if ([item, responsiblePerson, value(row, "Status")].includes("")) {
    return { ...base, daysRemaining: null, state: "missing" };
  }
  if (dueDate === "") return { ...base, daysRemaining: null, state: "not-dated" };
  const due = parseDueDate(item, dueDate);
  const daysRemaining = Math.floor((due - start) / 86_400_000);
  const reminderDays = parseReminder(value(row, "Advance reminder"));
  return { ...base, daysRemaining, state: classifyDate(daysRemaining, reminderDays) };
}

/**
 * Supplies a display name for a calendar item.
 * @param item - Raw item name.
 * @returns A non-empty display name.
 */
function displayItem(item: string): string {
  return item === "" ? "(unnamed)" : item;
}

/**
 * Parses an optional advance-reminder duration.
 * @param value - Raw reminder text.
 * @returns Requested days or the default.
 */
function parseReminder(value: string): number {
  const requested = Number.parseInt(value, 10);
  return Number.isFinite(requested) ? requested : 30;
}

/**
 * Parses a required ISO calendar date as UTC.
 * @param item - Calendar item used in validation errors.
 * @param dueDate - ISO date text.
 * @returns UTC epoch milliseconds.
 * @throws {Error} When the date is not ISO formatted.
 */
function parseDueDate(item: string, dueDate: string): number {
  const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dueDate);
  if (parsed === null) throw new Error(`${item}: due date must be YYYY-MM-DD`);
  return Date.UTC(Number(parsed[1]), Number(parsed[2]) - 1, Number(parsed[3]));
}

/**
 * Adds one CSV character to the current parser state.
 * @param character - Current source character.
 * @param next - Character following the current one, when present.
 * @param state - Mutable parser state.
 * @returns One when an escaped quote consumes the next character; otherwise zero.
 */
function consumeCharacter(character: string, next: string | undefined, state: CsvState): number {
  if (state.quoted) return consumeQuoted(character, next, state);
  consumeUnquoted(character, state);
  return 0;
}

/**
 * Adds an unquoted CSV character to parser state.
 * @param character - Source character.
 * @param state - Parser state.
 * @returns Nothing.
 */
function consumeUnquoted(character: string, state: CsvState): void {
  const handler = CSV_HANDLERS[character];
  if (handler !== undefined) handler(state);
  else state.field += character;
}

type CsvHandler = (state: CsvState) => void;
/** Handlers for unquoted CSV delimiters. */
const CSV_HANDLERS: Readonly<Record<string, CsvHandler>> = {
  '"': openQuotedField,
  ",": finishField,
  "\n": finishRow,
};

/**
 * Marks the current CSV field as quoted.
 * @param state - Mutable parser state.
 * @returns Nothing.
 */
function openQuotedField(state: CsvState): void {
  state.quoted = true;
}

/**
 * Adds a character encountered inside a quoted CSV field.
 * @param character - Current source character.
 * @param next - Following character, when present.
 * @param state - Mutable parser state.
 * @returns One when an escaped quote consumes the following character.
 */
function consumeQuoted(character: string, next: string | undefined, state: CsvState): number {
  if (character !== '"') { state.field += character; return 0; }
  if (next === '"') { state.field += '"'; return 1; }
  state.quoted = false;
  return 0;
}

/**
 * Completes the current CSV field.
 * @param state - Mutable parser state.
 * @returns Nothing.
 */
function finishField(state: CsvState): void {
  state.row.push(state.field);
  state.field = "";
}

interface CsvState { field: string; quoted: boolean; row: string[]; rows: string[][] }

/**
 * Completes the current CSV row.
 * @param state - Mutable parser state.
 * @returns Nothing.
 */
function finishRow(state: CsvState): void {
  state.row.push(state.field.replace(/\r$/, ""));
  state.rows.push(state.row);
  state.row = [];
  state.field = "";
}

/**
 * Parses RFC-style comma-separated values, including escaped quoted fields.
 * @param text - CSV source text.
 * @returns Non-empty rows and their field values.
 */
export function parseCsv(text: string): string[][] {
  const state: CsvState = { field: "", quoted: false, row: [], rows: [] };
  for (let index = 0; index < text.length; index += 1) {
    index += consumeCharacter(text[index]!, text[index + 1], state);
  }
  finishPendingRow(state);
  return state.rows.filter((values) => values.some((value) => value.trim().length > 0));
}

/**
 * Completes a pending final CSV row.
 * @param state - Parser state.
 * @returns Nothing.
 */
function finishPendingRow(state: CsvState): void {
  if (state.field.length + state.row.length > 0) finishRow(state);
}

/**
 * Audits compliance-calendar CSV records as of a supplied date.
 * @param text - Compliance calendar CSV text.
 * @param today - UTC audit date.
 * @returns One normalized finding per calendar row.
 * @throws {Error} When required columns or valid due dates are absent.
 */
export function auditComplianceCsv(text: string, today: Date): ComplianceFinding[] {
  const rows = parseCsv(text);
  const headers = rows.shift();
  if (headers === undefined) throw new Error("compliance calendar is empty");
  const index = new Map(headers.map((header, position) => [header.trim(), position]));
  validateHeaders(index);
  const value = createValueAccessor(index);
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return rows.map((row) => auditRow(row, value, start));
}

/**
 * Verifies that all compliance-calendar columns are present.
 * @param index - Header names mapped to column positions.
 * @returns Nothing.
 * @throws {Error} When a required column is absent.
 */
function validateHeaders(index: ReadonlyMap<string, number>): void {
  const requiredHeaders = ["Item", "Expiration/due date", "Advance reminder", "Responsible person", "Status", "Notes"];
  for (const required of requiredHeaders) {
    if (!index.has(required)) throw new Error(`compliance calendar missing column: ${required}`);
  }
}

/**
 * Creates a trimmed, header-aware CSV value accessor.
 * @param index - Header names mapped to column positions.
 * @returns An accessor for values in parsed rows.
 */
function createValueAccessor(index: ReadonlyMap<string, number>): CsvValue {
  return (row, header) => row[index.get(header)!]?.trim() ?? "";
}

/**
 * Reads and audits a compliance-calendar CSV file.
 * @param path - CSV file path.
 * @param today - UTC audit date.
 * @returns Normalized compliance findings.
 * @throws {Error} When the file or its records are invalid.
 */
export async function auditComplianceFile(path: string, today: Date): Promise<ComplianceFinding[]> {
  return auditComplianceCsv(await readFile(path, "utf8"), today);
}
