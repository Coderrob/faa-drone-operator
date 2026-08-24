import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "site-dist");
const errors: string[] = [];

/**
 * Recursively list files in a directory.
 * @param directory - Directory to traverse.
 * @returns Absolute paths for all descendant files.
 */
export function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

/**
 * Determine whether a built URL resolves to a file or directory index.
 * @param urlPath - Root-relative URL from generated markup.
 * @returns Whether the target exists in the static output.
 * @throws When the URL contains invalid percent encoding.
 */
export function targetExists(urlPath: string): boolean {
  const clean = decodeURIComponent(urlPath.split(/[?#]/, 1)[0]!);
  const direct = path.join(output, clean.replace(/^\//, ""));
  return fs.existsSync(direct) || fs.existsSync(path.join(direct, "index.html"));
}

/**
 * Record invalid local links in one generated HTML file.
 * @param file - Absolute path to generated HTML.
 * @returns Nothing.
 */
function validateLinks(file: string): void {
  const html = fs.readFileSync(file, "utf8");
  const relative = path.relative(output, file).replaceAll("\\", "/");
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const message = invalidLinkMessage(relative, match[1]!);
    if (message) errors.push(message);
  }
}

/**
 * Describe a broken local link when validation is required.
 * @param source - Generated file containing the link.
 * @param target - Link target extracted from markup.
 * @returns An error message, or undefined for a valid or external link.
 */
function invalidLinkMessage(source: string, target: string): string | undefined {
  return shouldValidateTarget(target) && !targetExists(target)
    ? `${source}: broken built URL ${target}` : undefined;
}

/**
 * Determines whether a link is an internal root-relative target.
 * @param target - Link target.
 * @returns Whether to validate it.
 */
function shouldValidateTarget(target: string): boolean {
  if (!target.startsWith("/")) return false;
  return !/^(https?:|mailto:|data:|#)/.test(target);
}

/**
 * Record a missing text marker.
 * @param content - Text to inspect.
 * @param marker - Required marker.
 * @param message - Error recorded when the marker is absent.
 * @returns Nothing.
 */
function requireMarker(content: string, marker: string, message: string): void {
  if (!content.includes(marker)) errors.push(message);
}

/**
 * Validate canonical study and exam payloads.
 * @returns Nothing.
 */
function validateQuizPayloads(): void {
  const study = fs.readFileSync(path.join(output, "study", "index.html"), "utf8");
  const exam = fs.readFileSync(path.join(output, "exam", "index.html"), "utf8");
  requireMarker(study, 'data-mode="study"', "Study page lacks quiz mode.");
  requireMarker(study, '"questions"', "Study page lacks quiz payload.");
  requireMarker(exam, 'data-mode="exam"', "Exam page lacks exam mode.");
  requireMarker(exam, '"questionIds"', "Exam page lacks form payload.");
  requireMarker(study, "CARD-REG-01", "Canonical question is absent from study page.");
  requireMarker(exam, "CARD-REG-01", "Canonical question is absent from exam page.");
}

/**
 * Validate rendered resource templates and their resource-page routes.
 * @returns Nothing.
 */
function validateResourcePages(): void {
  const resources = fs.readFileSync(path.join(output, "resources", "index.html"), "utf8");
  const mission = fs.readFileSync(path.join(output, "learn", "mission-record", "index.html"), "utf8");
  requireMarker(resources, 'href="/learn/mission-record/"', "Mission record does not use its rendered route.");
  requireMarker(resources, 'href="/learn/incident-record/"', "Incident record does not use its rendered route.");
  requireMarker(mission, "Authorization and planning", "Rendered mission record lacks template content.");
}

/**
 * Validate expected capabilities in generated JavaScript.
 * @param files - All generated file paths.
 * @returns Nothing.
 */
function validateScripts(files: string[]): void {
  const scripts = files.filter((file) => file.endsWith(".js"))
    .map((file) => fs.readFileSync(file, "utf8")).join("\n");
  for (const marker of ["localStorage", "part107:web", "expiresAt", ":choices"]) {
    requireMarker(scripts, marker, `Browser bundle lacks expected capability marker: ${marker}`);
  }
}

/**
 * Validate required GitHub Pages workflow actions and commands.
 * @returns Nothing.
 */
function validateWorkflow(): void {
  const file = path.join(root, ".github", "workflows", "deploy-pages.yml");
  const workflow = fs.readFileSync(file, "utf8");
  const markers = ["actions/upload-pages-artifact@v4", "actions/deploy-pages@v5", "BASE_PATH", "npm run check:cli"];
  for (const marker of markers) requireMarker(workflow, marker, `Pages workflow lacks ${marker}.`);
}

/**
 * Print validation errors and set a failing exit code.
 * @returns Whether errors were reported.
 */
function reportErrors(): boolean {
  for (const error of errors) console.error(`ERROR: ${error}`);
  if (errors.length === 0) return false;
  process.exitCode = 1;
  return true;
}

/**
 * Ensure the static build output is available.
 * @returns Whether validation can continue.
 */
function outputExists(): boolean {
  if (fs.existsSync(output)) return true;
  console.error("ERROR: site-dist is missing; run npm run build first.");
  process.exitCode = 1;
  return false;
}

/**
 * Record an insufficient generated page count.
 * @param count - Number of generated HTML files.
 * @returns Nothing.
 */
function validatePageCount(count: number): void {
  if (count < 34) errors.push(`Expected at least 34 HTML pages; found ${count}.`);
}

/**
 * Validate the complete generated site and deployment workflow.
 * @returns Nothing.
 */
function main(): void {
  if (!outputExists()) return;
  const files = walk(output);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  validatePageCount(htmlFiles.length);
  htmlFiles.forEach(validateLinks);
  validateQuizPayloads();
  validateResourcePages();
  validateScripts(files);
  validateWorkflow();
  if (reportErrors()) return;
  console.log(`PASS: ${htmlFiles.length} static HTML pages and ${files.length} built files validated under root.`);
  console.log("PASS: quiz payloads, persistence, assets, links, and Pages workflow markers validated.");
}

main();
