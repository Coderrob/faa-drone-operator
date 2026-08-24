import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "site-dist");
const base = "";
const errors = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function targetExists(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/, 1)[0]);
  const relative = clean.slice(base.length).replace(/^\//, "");
  const direct = path.join(output, relative);
  return fs.existsSync(direct) || fs.existsSync(path.join(direct, "index.html"));
}

if (!fs.existsSync(output)) {
  console.error("ERROR: site-dist is missing; run npm run build first.");
  process.exit(1);
}

const files = walk(output);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
if (htmlFiles.length < 31) errors.push(`Expected at least 31 HTML pages; found ${htmlFiles.length}.`);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const relative = path.relative(output, file).replaceAll("\\", "/");
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (!target || /^(https?:|mailto:|data:|#)/.test(target)) continue;
    if (target.startsWith("/") && !target.startsWith(`${base}/`)) {
      errors.push(`${relative}: root-absolute URL lacks Pages base: ${target}`);
      continue;
    }
    if (target.startsWith(`${base}/`) && !targetExists(target)) errors.push(`${relative}: broken built URL ${target}`);
  }
}

const study = fs.readFileSync(path.join(output, "study", "index.html"), "utf8");
const exam = fs.readFileSync(path.join(output, "exam", "index.html"), "utf8");
if (!study.includes('data-mode="study"') || !study.includes('"questions"')) errors.push("Study page lacks quiz payload.");
if (!exam.includes('data-mode="exam"') || !exam.includes('"questionIds"')) errors.push("Exam page lacks form payload.");
if (!study.includes("CARD-REG-01") || !exam.includes("CARD-REG-01")) errors.push("Canonical generated questions are absent from quiz pages.");

const scripts = files.filter((file) => file.endsWith(".js")).map((file) => fs.readFileSync(file, "utf8")).join("\n");
for (const capability of ["localStorage", "part107:web", "expiresAt", ":choices"]) {
  if (!scripts.includes(capability)) errors.push(`Browser bundle lacks expected capability marker: ${capability}`);
}

const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "deploy-pages.yml"), "utf8");
for (const marker of ["actions/upload-pages-artifact@v4", "actions/deploy-pages@v5", "BASE_PATH", "npm run check:cli"]) {
  if (!workflow.includes(marker)) errors.push(`Pages workflow lacks ${marker}.`);
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log(`PASS: ${htmlFiles.length} static HTML pages and ${files.length} built files validated under ${base}/.`);
console.log("PASS: study/exam payloads, browser persistence, bundled assets, internal links, and Pages workflow markers validated.");
