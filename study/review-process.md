# Study-Card Review and Remediation Process

The cards in [study-cards.md](study-cards.md) are prompts, not an answer bank for
memorizing test wording. Answer aloud or in writing before revealing the answer.

## Rating every answer

| Score | Standard | Next review |
|---:|---|---|
| 0 | Blank, unsafe, or materially wrong | Same session, then tomorrow |
| 1 | Partly right; missed a condition, exception, unit, or rationale | Tomorrow |
| 2 | Correct unaided, but slow or weak explanation | 3 days |
| 3 | Correct, prompt, and applied correctly to a new scenario | 7 days |

A guessed answer cannot score above 1. An answer that states the correct number
but misses its conditions cannot score above 1.

## Session workflow

1. Select 20–30 due cards, mixing all five ACS Areas.
2. Read only the question and ACS code.
3. State the answer and the operational reason. For a rule, name the trigger,
   limit, exception, and required action.
4. Reveal the answer and score 0–3.
5. Enter date, card ID, score, and error type in
   [review-log.csv](review-log.csv).
6. For every score 0 or 1, verify the concept in the cited FAA source, write a
   corrected explanation, and invent a different scenario.
7. End by retesting failed cards in shuffled order.

## Error types

Use one code so recurring weaknesses are visible:

- `R` rule/limit
- `C` condition or exception
- `CH` chart/airspace interpretation
- `WX` weather decoding/effect
- `CALC` loading/performance calculation
- `PROC` application or operational process
- `ADM` judgment/risk management
- `VOC` vocabulary/acronym

## Mastery gates

- A card is **learned** after scoring at least 2 twice on different days.
- A card is **mastered** after scoring 3 twice, at least seven days apart.
- An ACS Task is ready only when every critical-rule card is learned and at
  least 80% of its cards are mastered.
- Exam readiness additionally requires two fresh timed 60-question practice
  tests at 85% or higher and remediation of every missed ACS code.

Do not copy actual FAA test questions into this repository. Record the ACS code
from an AKTR or practice-test error and create a conceptually different prompt.
