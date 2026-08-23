import formsJson from "../data/mock-exams.json" with { type: "json" };
import type { Question } from "./types.js";

interface MockForm {
  readonly id: string;
  readonly questionIds: readonly string[];
}

export function selectMockForm(
  formId: string,
  questions: readonly Question[],
): Question[] {
  const form = (formsJson as readonly MockForm[]).find(
    ({ id }) => id.toUpperCase() === formId.toUpperCase(),
  );
  if (form === undefined) throw new Error(`unknown mock form ${formId}; use A or B`);
  const byId = new Map(questions.map((question) => [question.id, question]));
  return form.questionIds.map((id) => {
    const question = byId.get(id);
    if (question === undefined) throw new Error(`mock form ${form.id} references missing ${id}`);
    return question;
  });
}
