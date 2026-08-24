# GitHub Pages Website

The repository includes a static Astro website styled with Tailwind CSS. It
renders the curated Markdown library and provides browser-based study-card and
mock-exam workflows. Learner state remains in the browser's `localStorage`; the
site has no server, account system, analytics, or data upload.

Implementation follows Astro's official
[GitHub Pages deployment guide](https://docs.astro.build/en/guides/deploy/github/)
and Tailwind CSS's official
[Vite integration](https://tailwindcss.com/docs/installation/using-vite).

## Local development

Requirements: Node.js 20 or newer and npm.

```powershell
npm ci
npm run dev
```

Astro serves the site under `/faa-drone-operator/` to reproduce the GitHub Pages
project path. Use the URL printed by Astro and append that base path if needed.

Run a production build and preview:

```powershell
npm run build
npm run validate:site
npm run preview
```

The generated site is written to the ignored `site-dist/` directory. CLI output
is separately written to `dist-cli/`.

Run the complete source, type, build, and static-link suite with `npm run check`.
After installing Playwright Chromium once (`npx playwright install chromium`),
run browser interaction tests with `npm run test:e2e`.

## Deployment

The workflow at `.github/workflows/deploy-pages.yml` validates the CLI,
curriculum, mock exams, and Astro build before uploading the static artifact. It
runs on pull requests for validation and deploys pushes to `main`.

In the GitHub repository:

1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push or merge to `main`, or run the workflow manually.
4. Visit `https://coderrob.github.io/faa-drone-operator/` after deployment.

The workflow derives the owner and repository name from GitHub, setting Astro's
`site` and `base` values for the deployed project. All internal site links and
bundled assets use Astro's base path.

## Site architecture

- `web/layouts/` contains the document shell.
- `web/components/` contains small reusable navigation, content, form, progress,
  and quiz components.
- `web/pages/` contains static routes.
- `web/lib/documents.ts` curates and renders source Markdown at build time.
- `web/scripts/quiz-app.ts` owns accessible browser quiz/exam state.
- `web/styles/global.css` defines Tailwind design tokens and document typography.
- `tools/validate-site.mjs` verifies production routes, assets, base paths, and
  quiz payloads.

## Quiz behavior and privacy

- Study mode filters by ACS Area/topic/count and reveals explanations after an
  answer.
- Exam mode uses fixed Forms A/B, a 120-minute timer, and delays explanations
  until submission.
- Both modes use the existing deterministic seeded answer ordering.
- Active sessions and the last 50 summary results are saved only on the current
  device. Clearing site data removes them.
- Keyboard shortcuts are `1`–`4` for answers, arrow keys for navigation, and
  `F` to flag a question.

The web application consumes the same canonical JSON as the CLI. Do not edit
generated question data by hand; rebuild it through the existing tools and run
the complete validation suite.
