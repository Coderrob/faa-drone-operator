import questionsJson from "../data/questions.json" with { type: "json" };
import cardQuestionsJson from "../data/card-questions.json" with { type: "json" };
import type { AcsArea, Question } from "./types.js";

export interface QuestionFilter {
  readonly area?: AcsArea;
  readonly topic?: string;
  readonly dueIds?: ReadonlySet<string>;
}

export function loadQuestions(): readonly Question[] {
  return [
    ...(questionsJson as unknown as readonly Question[]),
    ...(cardQuestionsJson as unknown as readonly Question[]),
  ];
}

export function filterQuestions(
  questions: readonly Question[],
  filter: QuestionFilter,
): Question[] {
  const topic = filter.topic?.trim().toLocaleLowerCase();
  return questions.filter((question) => {
    if (filter.area !== undefined && question.area !== filter.area) return false;
    if (topic !== undefined && !question.topic.toLocaleLowerCase().includes(topic)) return false;
    if (filter.dueIds !== undefined && !filter.dueIds.has(question.id)) return false;
    return true;
  });
}

export function validateQuestions(questions: readonly Question[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const validCode = /^UA\.(I|II|III|IV|V)\.[A-F]\.K\d+[a-z]?$/;

  for (const [index, question] of questions.entries()) {
    const location = `question[${index}]`;
    if (ids.has(question.id)) errors.push(`${location}: duplicate id ${question.id}`);
    ids.add(question.id);
    if (!validCode.test(question.acsCode)) errors.push(`${question.id}: invalid ACS code`);
    if (question.choices.length !== 4) errors.push(`${question.id}: must have four choices`);
    if (new Set(question.choices).size !== 4) errors.push(`${question.id}: choices must be unique`);
    if (question.correctIndex < 0 || question.correctIndex > 3) errors.push(`${question.id}: invalid correctIndex`);
    if (question.explanation.trim().length < 30) errors.push(`${question.id}: explanation too short`);
    if (question.remediation.trim().length < 10) errors.push(`${question.id}: remediation too short`);
    if (question.citations.length === 0) errors.push(`${question.id}: citation required`);
    if (question.original !== true) errors.push(`${question.id}: must be marked original`);
  }

  return errors;
}
