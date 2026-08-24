# Commander.js TypeScript Study CLI

The CLI uses original learning questions in `data/questions.json`. It does not
contain or claim to reproduce FAA examination questions.

## Requirements and installation

- Node.js 20 or later
- npm

```powershell
npm install
npm run check
```

The project is verified with Node.js 24.19.0. Use the declared Node 20+ engine;
run `npm run check` after installation to verify the local runtime.

## Commands

```powershell
# Interactive study; immediate explanations
npm run dev:cli -- study --count 10 --area II --seed airspace-1

# Topic filter
npm run dev:cli -- study --topic METAR --count 5

# Deterministic non-interactive session
npm run dev:cli -- study --count 4 --seed demo --answers A,C,S,B --no-save

# Exam mode with explanations held until the end
npm run dev:cli -- exam --count 60 --seed mock-a

# Fixed, release-reviewed 60-question form
npm run dev:cli -- exam --form A --seed attempt-1

# Revisit questions most recently answered incorrectly
npm run dev:cli -- study --remediate --count 10

# Review questions due on the 1/3/7/14/30-day schedule
npm run dev:cli -- study --due --today 2026-08-23 --count 10

# Summarize history
npm run dev:cli -- stats

# Validate the question dataset
npm run dev:cli -- validate
npm run dev:cli -- validate --release

# Audit compliance ownership and due dates (exit 3 for overdue/missing)
npm run dev:cli -- compliance --today 2026-08-23

# Machine-readable audit
npm run dev:cli -- compliance --calendar records/compliance.csv --json
```

The default history file is `.part107/history.json`. Override it with
`--history <path>`. Do not commit personally identifiable learner history.

## Canonical question fields

Each record includes stable ID, ACS code/Area/Task, topic, difficulty, critical
flag, prompt, exactly four answer choices, correct index, explanation,
remediation instruction, authoritative citations, and an `original: true`
attestation. Choice order is shuffled reproducibly from the session seed and
question ID.

## Current implementation status

The engine, commands, history/remediation logic, seedable randomization,
compliance audit, 156-question dataset, fixed mock forms, validation, and tests
are implemented. All generated distractors have question-specific reviewed
overrides and an `approved` release state. Normal validation checks schema and
integrity; `validate --release` additionally rejects any future unapproved
generated question. The PowerShell mock validator provides the same gate when
`PART107_RELEASE_VALIDATE=1`.
