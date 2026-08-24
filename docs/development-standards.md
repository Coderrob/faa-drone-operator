# Engineering standards

The repository treats maintainability and testability as release requirements.
The automated quality checks apply these limits to TypeScript application,
configuration, and tooling code.

## Required limits

- Cyclomatic complexity must be less than 4 per function.
- Functions may contain no more than 30 lines, excluding blank and comment lines.
- TypeScript, Astro, and JavaScript source files may contain no more than 350
  physical lines. The release content validator covers file types that ESLint
  does not parse directly.
- Functions require JSDoc with a description, documented parameters and return
  values, and documented thrown errors where applicable.
- Vitest line, function, branch, and statement coverage must be at least 95% for
  every measured domain module. Side-effect-only browser and process entrypoints
  are verified through Playwright and subprocess integration tests.
- New Node-based tooling is written in TypeScript; `.mjs` source files are not
  permitted.
- Unit tests are colocated with their production modules as `name.test.ts`.
  Every module included in Vitest coverage has exactly one adjacent test file;
  browser and process entrypoints use the colocated domain modules plus the
  Playwright/subprocess integration suites.
- Every `it(...)` title starts with `should`; ESLint enforces the convention.
- Every test file has one root `describe`, with tests placed in nested
  function-level `describe` suites; ESLint rejects top-level or shallow tests.
- All TypeScript is checked with the type-aware `recommended`, `strict`, and
  `stylistic` ESLint presets against `tsconfig.eslint.json`.
- Imports are grouped and alphabetized deterministically. Duplicate imports,
  imports after executable statements, and missing post-import spacing fail lint.
- Type-only imports must use TypeScript's explicit type-import syntax.

## FAST unit tests

Unit tests must be:

- **Fast:** avoid network access, arbitrary waits, browsers, and full application
  startup. Those belong in integration or Playwright suites.
- **Autonomous:** do not depend on execution order or shared mutable state. Use
  unique temporary paths and restore mocks and stubbed globals after each test.
- **Self-validating:** express pass/fail through assertions without manual log or
  artifact inspection.
- **Timely:** add or update the adjacent test in the same change as its module.

## Local verification

Install Node.js 20 or newer, then run:

```powershell
npm ci
npm run quality
npm run lint:markdown
npm run typecheck:all
npm run test:coverage
npm run check
```

The GitHub Actions workflow runs the same release gates before uploading the
Pages artifact. A pull request should not be merged while any gate is failing.
Selective CI runs Markdownlint for Markdown changes, ShellCheck for POSIX shell
changes, PSScriptAnalyzer for PowerShell changes, and the complete build, lint,
test, Astro, content, and site-validation pipeline for TypeScript application or
configuration changes.

## Documentation

The root `mkdocs.yml` builds this directory as a standalone documentation site:

```powershell
python -m pip install mkdocs
mkdocs serve
mkdocs build --strict
```

The Astro learning site remains the production learner experience. MkDocs gives
contributors a conventional documentation preview and strict navigation/link
validation workflow.
