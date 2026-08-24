# FAA Part 107 Remote Pilot Study Kit

The polished browser edition is built with Astro and Tailwind CSS and is configured to deploy to
[GitHub Pages](https://coderrob.github.io/faa-drone-operator/). It includes the
full learning library, study-card sessions, and both timed mock exams.

```powershell
npm ci
npm run dev       # Astro website
npm run dev:cli -- study --count 10  # Commander CLI
```

See the [GitHub Pages guide](docs/13-github-pages.md) for production builds,
browser tests, deployment, base paths, architecture, and privacy behavior.

This kit curates the path, knowledge, and working habits needed to earn an FAA
Remote Pilot Certificate and begin operating a small uncrewed aircraft system
(sUAS) safely under 14 CFR Part 107.

> This is a study aid, not a substitute for current FAA regulations, an FAA
> authorization, a waiver, or the aircraft manufacturer's instructions. Rules,
> airspace, NOTAMs, and local restrictions can change. Verify them for every
> operation.

## Start here

1. Read the [curated FAA source content](docs/00-faa-source-content.md).
2. Follow the [certification roadmap](docs/01-certification-roadmap.md).
3. Complete the [account, pilot, and aircraft registration processes](docs/06-registration-processes.md).
4. Work through the [ACS study guide](docs/02-acs-study-guide.md) and the
   [domain knowledge handbook](docs/07-domain-knowledge-handbook.md).
5. Use the [14-day study plan](docs/03-study-plan.md) and mark each objective in
   [the ACS tracker](trackers/acs-progress.csv).
6. Before real operations, adopt the [field operations checklists](docs/04-field-operations.md).
7. Use the [glossary and memory sheet](docs/05-glossary-memory-sheet.md) for review.

## Practice and records

- [Study-card Q/A deck](study/study-cards.md)
- [Supplemental element-completion cards](study/supplemental-element-cards.md)
- [Study-card review and remediation process](study/review-process.md)
- [Worked knowledge exercises](study/worked-exercises.md)
- [Mock-exam workflow](study/mock-exams.md), [Form A](study/mock-exam-a.md), and [Form B](study/mock-exam-b.md)
- [Commander.js TypeScript study CLI](docs/08-study-cli.md)
- [Parts 89/107 regulatory index](docs/09-regulatory-index.md)
- [Progressive flight-training syllabus](docs/10-flight-training-syllabus.md)
- [Registration and certification scenarios](docs/11-registration-scenarios.md)
- [Ongoing operational compliance program](docs/12-operational-compliance.md)
- [Mission-specific SOPs](sops/README.md)
- [Canonical ACS element inventory](data/acs-elements.csv)
- [Requirements and coverage matrix](validation/requirements-matrix.md)
- [Completion and verification report](validation/completion-report.md)
- [Compliance calendar](templates/compliance-calendar.csv)
- [Pilot and aircraft records](templates/pilot-aircraft-record.md)
- [Mission plan and flight log](templates/mission-record.md)
- [Maintenance and battery log](templates/maintenance-battery-log.csv)
- [Incident and accident record](templates/incident-record.md)

## What the test looks like

The initial Unmanned Aircraft General – Small (UAG) test has 60 independent,
multiple-choice questions and a two-hour limit. A score of 70% or better passes.

| ACS area | FAA test range | Approx. questions out of 60 |
|---|---:|---:|
| I. Regulations | 15–25% | 9–15 |
| II. Airspace and requirements | 15–25% | 9–15 |
| III. Weather | 11–16% | 7–10 |
| IV. Loading and performance | 7–11% | 4–7 |
| V. Operations | 35–45% | 21–27 |

The approximate counts are planning estimates; the FAA specifies percentages,
not a fixed count by area.

## Primary sources

- [FAA: Become a Certificated Remote Pilot](https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot) — eligibility, first-time and Part 61 paths, application, and recency.
- [IACRA](https://iacra.faa.gov/IACRA/Default.aspx) — obtain an FAA Tracking Number (FTN) and submit FAA Form 8710-13.
- [Remote Pilot sUAS Airman Certification Standards, FAA-S-ACS-10B](https://www.faa.gov/sites/faa.gov/files/training_testing/testing/acs/uas_acs.pdf) — the test blueprint and ACS codes.
- [PSI FAA testing portal](https://faa.psiexams.com/faa/login) — locate, schedule, and pay for the UAG test.
- [FAA Safety Team](https://www.faasafety.gov/) — initial training for eligible Part 61 pilots and recurrent training.

Source check: August 23, 2026. The FAA certification page reported an update on
June 9, 2026; the linked ACS is FAA-S-ACS-10B, effective April 6, 2021. Always
check the FAA page for a newer ACS before studying or testing.

To validate the local package on Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\validation\Test-Content.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\validation\Test-AcsCoverage.ps1
$env:PART107_RELEASE_VALIDATE = '1'
powershell -NoProfile -ExecutionPolicy Bypass -File .\validation\Test-MockExams.ps1
npm run check
npm run dev:cli -- validate --release
```

The bypass is process-scoped and is useful where local script execution is
disabled by default; it does not change the machine's execution policy.

## Scope

This kit includes the federal Part 107 certificate process, aircraft registration,
the complete ACS topic structure, and baseline operating knowledge. It also
introduces common mission domains, but does not replace hands-on flight practice,
aircraft-specific training, business licensing, insurance review, local law
research, or specialized professional qualifications.
