import { CRITERION_LABELS, type CriterionResult } from "./types";

export type Explanation = {
  positives: string[];
  considerations: string[];
  warnings: string[];
};

const POSITIVE_THRESHOLD = 0.75;
const CONSIDERATION_THRESHOLD = 0.5;

export function buildExplanation(criteria: CriterionResult[]): Explanation {
  const positives: string[] = [];
  const considerations: string[] = [];
  const warnings: string[] = [];

  for (const criterion of criteria) {
    const label = CRITERION_LABELS[criterion.key];

    if (criterion.score == null) {
      warnings.push(`No pudimos verificar: ${label.toLowerCase()}.`);
      continue;
    }

    if (criterion.score >= POSITIVE_THRESHOLD) {
      positives.push(criterion.explanation);
    } else if (criterion.score < CONSIDERATION_THRESHOLD) {
      considerations.push(criterion.explanation);
    }
  }

  return { positives, considerations, warnings };
}
