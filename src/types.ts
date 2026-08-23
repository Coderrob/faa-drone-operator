export const ACS_AREAS = ["I", "II", "III", "IV", "V"] as const;
export type AcsArea = (typeof ACS_AREAS)[number];

export interface Citation {
  readonly label: string;
  readonly url: string;
  readonly locator: string;
}

export interface Question {
  readonly id: string;
  readonly acsCode: string;
  readonly area: AcsArea;
  readonly task: string;
  readonly topic: string;
  readonly difficulty: 1 | 2 | 3;
  readonly critical: boolean;
  readonly prompt: string;
  readonly choices: readonly [string, string, string, string];
  readonly correctIndex: 0 | 1 | 2 | 3;
  readonly explanation: string;
  readonly remediation: string;
  readonly citations: readonly Citation[];
  readonly original: true;
  /** Present on generated questions; `approved` is required for release use. */
  readonly distractorReview?: string;
}

export interface PresentedQuestion {
  readonly question: Question;
  readonly choices: readonly string[];
  readonly correctIndex: number;
}

export interface AnswerResult {
  readonly questionId: string;
  readonly acsCode: string;
  readonly selectedIndex: number | null;
  readonly correct: boolean;
}

export interface SessionRecord {
  readonly id: string;
  readonly mode: "study" | "exam";
  readonly startedAt: string;
  readonly completedAt: string;
  readonly seed: string;
  readonly answers: readonly AnswerResult[];
}

export interface HistoryFile {
  readonly version: 1;
  readonly sessions: readonly SessionRecord[];
}
