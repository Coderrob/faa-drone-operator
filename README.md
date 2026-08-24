# Part 107 Flight Desk

[![Deploy Astro site to GitHub Pages](https://github.com/Coderrob/faa-drone-operator/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Coderrob/faa-drone-operator/actions/workflows/deploy-pages.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-0ea5e9?logo=github)](https://coderrob.github.io/faa-drone-operator/)
[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)](package.json)

A source-grounded FAA Part 107 learning and operations workspace. It combines a
step-by-step certification guide, ACS-mapped study material, interactive study
cards, two full mock exams, a TypeScript CLI, and reusable compliance records.

**[Open the learning site](https://coderrob.github.io/faa-drone-operator/)** ·
**[Study cards](https://coderrob.github.io/faa-drone-operator/study/)** ·
**[Take a mock exam](https://coderrob.github.io/faa-drone-operator/exam/)**

> [!IMPORTANT]
> This project is an independent study aid, not an FAA publication or a
> substitute for current regulations, authorizations, waivers, NOTAMs, local
> requirements, or aircraft-manufacturer instructions. Verify current
> requirements before every operation.

## What is included

- Complete first-time and Part 61 certification paths, from FAA Tracking Number
  (FTN) creation through IACRA application and recurrent training
- The five FAA-S-ACS-10B knowledge areas, organized into a study guide and a
  trackable ACS element inventory
- 156 original, cited, ACS-mapped practice questions with focused browser study
  sessions and local progress history
- Two original 60-question, 120-minute mock exams with scoring and remediation
- Domain guides for regulations, airspace, weather, loading and performance,
  airport operations, night operations, Remote ID, and operations over people
- Field checklists, mission-specific SOPs, registration scenarios, and editable
  pilot, aircraft, maintenance, battery, mission, incident, and compliance logs
- A Commander.js TypeScript CLI for study sessions, mock exams, review history,
  content validation, and compliance-calendar auditing
- A static Astro and Tailwind CSS site deployable to GitHub Pages

All browser study history stays in the browser's local storage. The static site
has no account system and does not send quiz responses to a project server.

## Recommended path

1. Review the [curated FAA source content](docs/00-faa-source-content.md).
2. Follow the [certification roadmap](docs/01-certification-roadmap.md).
3. Complete the [registration and application processes](docs/06-registration-processes.md).
4. Study the [ACS guide](docs/02-acs-study-guide.md) and
   [domain knowledge handbook](docs/07-domain-knowledge-handbook.md).
5. Use the [14-day study plan](docs/03-study-plan.md),
   [study-card deck](study/study-cards.md), and
   [ACS progress tracker](trackers/acs-progress.csv).
6. Take the [mock exams](study/mock-exams.md) and remediate missed objectives.
7. Before operating, adopt the [field checklists](docs/04-field-operations.md),
   [mission SOPs](sops/README.md), and
   [ongoing compliance program](docs/12-operational-compliance.md).

## FAA knowledge-test blueprint

The initial Unmanned Aircraft General - Small (UAG) knowledge test contains 60
independent multiple-choice questions, allows two hours, and requires a score of
70% or better.

| ACS area | FAA test range | Planning estimate out of 60 |
|---|---:|---:|
| I. Regulations | 15-25% | 9-15 |
| II. Airspace and requirements | 15-25% | 9-15 |
| III. Weather | 11-16% | 7-10 |
| IV. Loading and performance | 7-11% | 4-7 |
| V. Operations | 35-45% | 21-27 |

The question counts are study-planning estimates; the FAA specifies percentage
ranges rather than a fixed question count for each area.

## Run locally

Requirements: Node.js 20 or newer and npm.

```powershell
npm ci
npm run dev
```

Astro prints the local site URL. To use the terminal study tool:

```powershell
npm run dev:cli -- study --count 10
npm run dev:cli -- exam --form A
npm run dev:cli -- --help
```

See the [CLI guide](docs/08-study-cli.md) for every command and the
[GitHub Pages guide](docs/13-github-pages.md) for deployment and base-path
configuration.

## Validate changes

```powershell
npm run check
npm run test:e2e
```

The full content-release checks are also available directly on Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\validation\Test-Content.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\validation\Test-AcsCoverage.ps1
$env:PART107_RELEASE_VALIDATE = '1'
powershell -NoProfile -ExecutionPolicy Bypass -File .\validation\Test-MockExams.ps1
npm run dev:cli -- validate --release
```

## Key project resources

| Resource | Purpose |
|---|---|
| [Learning library](docs/) | Certification, knowledge, field operations, and compliance guidance |
| [Study materials](study/) | Cards, exercises, review workflow, and mock exams |
| [Operational templates](templates/) | Reusable pilot, aircraft, mission, maintenance, and incident records |
| [Mission SOPs](sops/) | Photography, mapping, inspection, construction, agriculture, and public-safety controls |
| [Canonical data](data/) | ACS elements, questions, and fixed mock-exam definitions |
| [Coverage evidence](validation/requirements-matrix.md) | Traceability from requirements to project artifacts |

Do not commit Social Security numbers, payment details, identity documents,
IACRA credentials, certificate images, or sensitive client and mission data.

## Authoritative sources

- [FAA: Become a Certificated Remote Pilot](https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot)
- [FAA Integrated Airman Certification and Rating Application (IACRA)](https://iacra.faa.gov/IACRA/Default.aspx)
- [Remote Pilot sUAS Airman Certification Standards, FAA-S-ACS-10B](https://www.faa.gov/sites/faa.gov/files/training_testing/testing/acs/uas_acs.pdf)
- [PSI FAA testing portal](https://faa.psiexams.com/faa/login)
- [FAA Safety Team](https://www.faasafety.gov/)
- [Electronic Code of Federal Regulations: 14 CFR Part 107](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-107)

The source review recorded in this project was performed on August 23, 2026.
Check the FAA certification page and ACS document for revisions before studying,
testing, or relying on an operational requirement.

## Scope

The project covers the federal Part 107 certificate process, aircraft
registration, the complete ACS topic structure, and baseline operating
knowledge. It does not replace hands-on flight practice, aircraft-specific
training, insurance or business advice, local-law research, or specialized
professional qualifications.
