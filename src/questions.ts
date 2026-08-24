import cardQuestionsJson from "../data/card-questions.json" with { type: "json" };
import questionsJson from "../data/questions.json" with { type: "json" };
import type { AcsArea, Question } from "./types.js";

export interface QuestionFilter {
  readonly area?: AcsArea | undefined;
  readonly topic?: string | undefined;
  readonly dueIds?: ReadonlySet<string> | undefined;
}

type QuestionCandidate = Omit<Question, "choices" | "correctIndex" | "original"> & {
  readonly choices: readonly string[];
  readonly correctIndex: number;
  readonly original: boolean;
};
type QuestionRule = (question: QuestionCandidate) => string | undefined;
const VALID_CODE = /^UA\.(I|II|III|IV|V)\.[A-F]\.K\d+[a-z]?$/;
const QUESTION_RULES: readonly QuestionRule[] = [
  (question) => VALID_CODE.test(question.acsCode) ? undefined : "invalid ACS code",
  (question) => question.choices.length === 4 ? undefined : "must have four choices",
  (question) => new Set(question.choices).size === 4 ? undefined : "choices must be unique",
  (question) => question.correctIndex >= 0 && question.correctIndex <= 3 ? undefined : "invalid correctIndex",
  (question) => question.explanation.trim().length >= 30 ? undefined : "explanation too short",
  (question) => question.remediation.trim().length >= 10 ? undefined : "remediation too short",
  (question) => question.citations.length > 0 ? undefined : "citation required",
  (question) => question.original ? undefined : "must be marked original",
];

/**
 * Applies structural rules to one question.
 * @param question - Question to inspect.
 * @returns Validation errors for the question.
 */
function questionErrors(question: QuestionCandidate): string[] {
  return QUESTION_RULES
    .map((rule) => rule(question))
    .filter((message): message is string => message !== undefined)
    .map((message) => `${question.id}: ${message}`);
}

/**
 * Loads the hand-authored and study-card question datasets.
 * @returns The combined canonical question collection.
 */
export function loadQuestions(): readonly Question[] {
  return [
    ...(questionsJson as unknown as readonly Question[]),
    ...(cardQuestionsJson as unknown as readonly Question[]),
  ];
}

/**
 * Filters questions by any requested area, topic, and due identifiers.
 * @param questions - Questions available for selection.
 * @param filter - Optional selection constraints.
 * @returns Questions matching every supplied constraint.
 */
export function filterQuestions(
  questions: readonly Question[],
  filter: QuestionFilter,
): Question[] {
  const topic = filter.topic?.trim().toLocaleLowerCase();
  return questions.filter((question) => matchesFilter(question, filter, topic));
}

/**
 * Determines whether one question satisfies all active filters.
 * @param question - Candidate question.
 * @param filter - Active selection constraints.
 * @param topic - Normalized topic text.
 * @returns Whether the question matches.
 */
function matchesFilter(question: Question, filter: QuestionFilter, topic?: string): boolean {
  return areaMatches(question, filter.area) && topicMatches(question, topic) && dueMatches(question, filter.dueIds);
}

/**
 * Checks an area filter.
 * @param question - Candidate question.
 * @param area - Required area.
 * @returns Whether it matches.
 */
function areaMatches(question: Question, area?: AcsArea): boolean {
  return area === undefined || question.area === area;
}

/**
 * Checks a topic filter.
 * @param question - Candidate question.
 * @param topic - Required topic.
 * @returns Whether it matches.
 */
function topicMatches(question: Question, topic?: string): boolean {
  return topic === undefined || question.topic.toLocaleLowerCase().includes(topic);
}

/**
 * Checks a due-ID filter.
 * @param question - Candidate question.
 * @param dueIds - Required IDs.
 * @returns Whether it matches.
 */
function dueMatches(question: Question, dueIds?: ReadonlySet<string>): boolean {
  return dueIds === undefined || dueIds.has(question.id);
}

/**
 * Validates question records against release-critical structural rules.
 * @param questions - Questions to validate.
 * @returns Human-readable validation errors; empty when valid.
 */
export function validateQuestions(questions: readonly Question[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const [index, question] of questions.entries()) {
    const location = `question[${index}]`;
    if (ids.has(question.id)) errors.push(`${location}: duplicate id ${question.id}`);
    ids.add(question.id);
    errors.push(...questionErrors(question));
  }

  return errors;
}
