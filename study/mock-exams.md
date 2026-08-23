# Mock Examinations

Two fixed forms are defined in `data/mock-exams.json`. Each has 60 unique,
original questions, a 120-minute limit, a 70% threshold, and an ACS Area
distribution inside FAA-S-ACS-10B ranges. `data/card-questions.json` contains
each key (`correctIndex`), rationale, ACS mapping, remediation and citation.
Printable versions with deterministically shuffled choices and full answer keys
are available as `study/mock-exam-a.md` and `study/mock-exam-b.md`.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\Build-QuestionBank.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\Build-MockExamDocs.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\validation\Test-MockExams.ps1
```

## Release status

Both forms are `release-reviewed`. All 150 generated questions use durable,
question-specific overrides from `data/distractor-overrides.json`; each override
records its review method and date. Release validation rejects a form whose
status is not reviewed or any question whose `distractorReview` is not
`approved`. These are original practice questions, not reproduced FAA items.

The records already provide machine-readable answer keys and explanations. After
a practice attempt, remediate each missed ACS code in its mapped lesson, card and
exercise rather than memorizing form order.
