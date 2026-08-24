import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { repositoryUrl, sitePath } from "./paths";

export interface DocumentEntry {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  file: string;
  order: number;
}

const entries: DocumentEntry[] = [
  { slug: "faa-source-content", title: "FAA source content", eyebrow: "Foundation", summary: "What the FAA, IACRA, and ACS sources require—and how to keep them current.", file: "docs/00-faa-source-content.md", order: 0 },
  { slug: "certification-roadmap", title: "Certification roadmap", eyebrow: "Get certified", summary: "A stepwise path from eligibility and FTN through testing, IACRA, and currency.", file: "docs/01-certification-roadmap.md", order: 1 },
  { slug: "acs-study-guide", title: "ACS study guide", eyebrow: "Learn", summary: "The complete knowledge blueprint organized across all five ACS Areas.", file: "docs/02-acs-study-guide.md", order: 2 },
  { slug: "study-plan", title: "14-day study plan", eyebrow: "Prepare", summary: "A focused schedule that moves from rules to full mock-exam readiness.", file: "docs/03-study-plan.md", order: 3 },
  { slug: "field-operations", title: "Field operations", eyebrow: "Operate", summary: "Mission planning, preflight, crew, flight, and postflight checklists.", file: "docs/04-field-operations.md", order: 4 },
  { slug: "glossary", title: "Glossary & memory sheet", eyebrow: "Review", summary: "High-value terms, limits, weather codes, and memory aids.", file: "docs/05-glossary-memory-sheet.md", order: 5 },
  { slug: "registration", title: "Registration processes", eyebrow: "Register", summary: "Applicant, test, certificate, aircraft, and Remote ID data workflows.", file: "docs/06-registration-processes.md", order: 6 },
  { slug: "domain-handbook", title: "Domain knowledge handbook", eyebrow: "Master", summary: "Airspace, weather, performance, night, OOP, airport, and emergency knowledge.", file: "docs/07-domain-knowledge-handbook.md", order: 7 },
  { slug: "study-cli", title: "Study CLI", eyebrow: "Tools", summary: "Local command-line study, exam, review, history, and compliance workflows.", file: "docs/08-study-cli.md", order: 8 },
  { slug: "regulatory-index", title: "Parts 89 & 107 index", eyebrow: "Reference", summary: "Direct routes from operational questions to current controlling regulations.", file: "docs/09-regulatory-index.md", order: 9 },
  { slug: "flight-syllabus", title: "Flight-training syllabus", eyebrow: "Practice", summary: "Eight progressive field lessons with proficiency gates and signoff rubric.", file: "docs/10-flight-training-syllabus.md", order: 10 },
  { slug: "registration-scenarios", title: "Registration scenarios", eyebrow: "Apply", summary: "Ten realistic applicant, aircraft, ownership, and Remote ID cases.", file: "docs/11-registration-scenarios.md", order: 11 },
  { slug: "operational-compliance", title: "Operational compliance", eyebrow: "Sustain", summary: "A practical control cycle for records, approvals, incidents, and changes.", file: "docs/12-operational-compliance.md", order: 12 },
  { slug: "github-pages", title: "GitHub Pages website", eyebrow: "Publish", summary: "Develop, validate, and deploy the Astro learning site through GitHub Actions.", file: "docs/13-github-pages.md", order: 13 },
  { slug: "worked-exercises", title: "Worked exercises", eyebrow: "Practice", summary: "Twelve applied chart, weather, runway, performance, and night scenarios.", file: "study/worked-exercises.md", order: 14 },
  { slug: "study-cards", title: "Study-card deck", eyebrow: "Review", summary: "The original ACS-coded question-and-answer learning deck.", file: "study/study-cards.md", order: 14 },
  { slug: "review-process", title: "Review & remediation", eyebrow: "Improve", summary: "A repeatable scoring, spaced-review, and remediation process.", file: "study/review-process.md", order: 15 },
  { slug: "mock-exams", title: "Mock-exam workflow", eyebrow: "Test", summary: "How to take, score, review, and remediate the two fixed exam forms.", file: "study/mock-exams.md", order: 16 },
  { slug: "sop-overview", title: "Mission SOPs", eyebrow: "Operate", summary: "How to adopt and tailor the six mission-specific operating procedures.", file: "sops/README.md", order: 17 },
  { slug: "sop-photography", title: "Photography & video SOP", eyebrow: "SOP", summary: "Controls for media capture around clients, subjects, property, and bystanders.", file: "sops/photography-video.md", order: 18 },
  { slug: "sop-mapping", title: "Mapping & photogrammetry SOP", eyebrow: "SOP", summary: "Controls for grid missions, overlap, positioning, and data quality.", file: "sops/mapping-photogrammetry.md", order: 19 },
  { slug: "sop-inspection", title: "Infrastructure inspection SOP", eyebrow: "SOP", summary: "Standoff, obstruction, RF, and asset-owner controls for inspections.", file: "sops/infrastructure-inspection.md", order: 20 },
  { slug: "sop-construction", title: "Construction & real-estate SOP", eyebrow: "SOP", summary: "People, vehicles, active worksite, and property coordination controls.", file: "sops/construction-real-estate.md", order: 21 },
  { slug: "sop-agriculture", title: "Agriculture SOP", eyebrow: "SOP", summary: "Low-level rural-flight, equipment, worker, and adjacent-property controls.", file: "sops/agriculture.md", order: 22 },
  { slug: "sop-public-safety", title: "Public-safety SOP", eyebrow: "SOP", summary: "Incident-command, emergency-airspace, evidence, and responder coordination.", file: "sops/public-safety.md", order: 23 },
];

const root = process.cwd();
const absoluteByFile = new Map(entries.map((entry) => [path.resolve(root, entry.file), entry]));

export function getDocuments(): DocumentEntry[] {
  return [...entries].sort((a, b) => a.order - b.order);
}

export function getDocument(slug: string): DocumentEntry | undefined {
  return entries.find((entry) => entry.slug === slug);
}

function rewriteLinks(markdown: string, sourceFile: string): string {
  return markdown.replace(/\]\((?!https?:|mailto:|#)([^)\s]+)(#[^)]+)?\)/g, (full, target: string, hash = "") => {
    const resolved = path.resolve(path.dirname(path.resolve(root, sourceFile)), decodeURIComponent(target));
    const document = absoluteByFile.get(resolved);
    if (document) return `](${sitePath(`/learn/${document.slug}/${hash}`)})`;
    const relative = path.relative(root, resolved).replaceAll("\\", "/");
    if (!relative.startsWith("..")) return `](${repositoryUrl}/blob/main/${relative}${hash})`;
    return full;
  });
}

export function renderDocument(entry: DocumentEntry): string {
  const markdown = fs.readFileSync(path.resolve(root, entry.file), "utf8");
  const withoutFirstHeading = markdown.replace(/^#\s+[^\r\n]+\r?\n+/, "");
  return marked.parse(rewriteLinks(withoutFirstHeading, entry.file), { gfm: true }) as string;
}
