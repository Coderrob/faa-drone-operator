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

## Local verification

Install Node.js 20 or newer, then run:

```powershell
npm ci
npm run quality
npm run typecheck:tools
npm run test:coverage
npm run check
```

The GitHub Actions workflow runs the same release gates before uploading the
Pages artifact. A pull request should not be merged while any gate is failing.

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
