# Goal Requirements and Coverage Matrix

Status values must be supported by current repository evidence. “Covered” means
the artifact exists and directly addresses the requirement; it does not certify
that an external agency will approve a particular applicant or operation.

| Requirement | Evidence | Status |
|---|---|---|
| Source content curated, not link-only | `docs/00-faa-source-content.md` contains structured FAA page, IACRA, and ACS substance | Covered |
| First-time eligibility and path | `docs/01-certification-roadmap.md`; `docs/06-registration-processes.md` A–C | Covered |
| Part 61/current-flight-review path | `docs/01-certification-roadmap.md`; registration guide D | Covered |
| IACRA Applicant/FTN registration | registration guide A | Covered |
| PSI UAG registration/testing | registration guide B; study plan exam process | Covered |
| Form 8710-13 and certificate issuance | registration guide C/D | Covered |
| Aircraft registration and marking | registration guide E; pilot/aircraft record | Covered |
| Remote ID selection/inventory/preflight | registration guide E/F; domain handbook §8 | Covered |
| Airspace/LAANC/manual authorization | domain handbook §2; field checklist | Covered |
| Waiver distinction and compliance | ACS guide I.C–D; domain handbook §1; mission record | Covered |
| Recurrent training/currency | certification roadmap; compliance calendar | Covered |
| Ongoing registration/compliance data | all files in `templates/` | Covered |
| ACS knowledge Areas/Tasks | ACS guide I–V; tracker has every ACS Task | Covered |
| Practical domain knowledge | domain handbook §§1–11 | Covered |
| Q/A study cards | `study/study-cards.md`, with ACS code per card | Covered |
| Repeatable scoring/remediation | `study/review-process.md`; `study/review-log.csv` | Covered |
| Operational checklists | `docs/04-field-operations.md`; mission template | Covered |
| Registration/flight/maintenance/incident records | templates directory | Covered |
| Authoritative source and freshness controls | `validation/source-register.md` | Covered |
| Internal-link/artifact verification | `validation/Test-Content.ps1` and its latest run | Covered when test passes |
| Canonical element/sub-element inventory | 176 rows in `data/acs-elements.csv`; `Test-AcsCoverage.ps1` | Covered |
| Worked chart/weather/performance/airport/comms/night exercises | 12 worked exercises in `study/worked-exercises.md` | Covered |
| Two original 60-question exams with complete keys | printable Forms A/B plus machine-readable form/bank JSON | Covered and release-validated |
| Element-complete multiple-choice bank with reviewed distractors | 150 source cards and 150 reviewed records in `data/distractor-overrides.json` | Covered and release-validated |
| Direct CFR/FAA/ACS citations | question citations plus Parts 89/107 regulatory index | Covered and release-validated |
| Progressive flight syllabus and evaluation rubric | `docs/10-flight-training-syllabus.md` | Covered |
| Registration scenarios, deeper compliance, and mission SOPs | `docs/11-registration-scenarios.md`, `docs/12-operational-compliance.md`, six SOPs | Covered |
| Commander.js TypeScript study/exam/compliance CLI | `src/`, `test/`, `docs/08-study-cli.md` | Covered; build, 18 tests, runtime smoke tests pass |

## ACS Task coverage

| ACS Task | Primary instruction | Practice evidence |
|---|---|---|
| UA.I.A General | ACS guide I.A | REG-01–04 |
| UA.I.B Operating Rules | ACS guide I.B | REG-05–21 |
| UA.I.C Certification | ACS guide I.C | REG-22–23 |
| UA.I.D Waivers | ACS guide I.D | REG-24 |
| UA.I.E Operations Over People | ACS guide I.E; handbook §7 | REG-25–28 |
| UA.I.F Remote ID | ACS guide I.F; handbook §8 | REG-29–31 |
| UA.II.A Airspace Classification | ACS guide II.A; handbook §2 | AIR-01–06 |
| UA.II.B Airspace Requirements | ACS guide II.B; handbook §2 | AIR-07–11 |
| UA.III.A Weather Sources | ACS guide III.A; handbook §3 | WX-01–05 |
| UA.III.B Weather Effects | ACS guide III.B; handbook §3 | WX-06–10 |
| UA.IV.A Loading/Performance | ACS guide IV; handbook §4 | PERF-01–05 |
| UA.V.A Radio Communications | ACS guide V.A | OPS-01–04 |
| UA.V.B Airport Operations | ACS guide V.B; handbook §9 | OPS-05–08 |
| UA.V.C Emergency Procedures | ACS guide V.C; handbook §10 | OPS-09–12 |
| UA.V.D Decision-Making | ACS guide V.D | OPS-13–17 |
| UA.V.E Physiology | ACS guide V.E | OPS-18–22 |
| UA.V.F Maintenance/Inspection | ACS guide V.F; handbook §4 | OPS-23–26 |

## Content boundaries disclosed to the learner

- FAA/eCFR and issued authorization/waiver text control over this kit.
- Time-sensitive airspace, NOTAM/TFR, weather, fees, vendor interface, accepted
  equipment, and local rules must be rechecked.
- Hands-on competence requires actual supervised practice; reading cannot prove it.
- Specialized dispensing, survey, public-aircraft, BVLOS, and other advanced work
  may need additional approvals or qualifications.

The detailed final evidence and command results are recorded in
`validation/completion-report.md`.
