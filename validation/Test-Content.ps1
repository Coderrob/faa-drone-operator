$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$requiredFiles = @(
    'README.md',
    'mkdocs.yml',
    'docs/index.md',
    'docs/development-standards.md',
    'docs/00-faa-source-content.md',
    'docs/01-certification-roadmap.md',
    'docs/02-acs-study-guide.md',
    'docs/03-study-plan.md',
    'docs/04-field-operations.md',
    'docs/05-glossary-memory-sheet.md',
    'docs/06-registration-processes.md',
    'docs/07-domain-knowledge-handbook.md',
    'study/study-cards.md',
    'study/supplemental-element-cards.md',
    'study/review-process.md',
    'study/worked-exercises.md',
    'study/mock-exams.md',
    'study/mock-exam-a.md',
    'study/mock-exam-b.md',
    'study/review-log.csv',
    'templates/compliance-calendar.csv',
    'templates/pilot-aircraft-record.md',
    'templates/mission-record.md',
    'templates/maintenance-battery-log.csv',
    'templates/incident-record.md',
    'trackers/acs-progress.csv',
    'validation/requirements-matrix.md',
    'validation/source-register.md',
    'validation/completion-report.md',
    'validation/site-completion-report.md',
    'package.json',
    'tsconfig.json',
    'tsconfig.tools.json',
    'data/questions.json',
    'data/acs-elements.csv',
    'data/card-questions.json',
    'data/mock-exams.json',
    'data/distractor-overrides.json',
    'src/cli.ts',
    'src/commands.ts',
    'src/compliance.ts',
    'src/history.ts',
    'src/mock-exams.ts',
    'src/questions.ts',
    'src/quiz.ts',
    'src/random.ts',
    'src/types.ts',
    'src/questions.test.ts',
    'src/quiz.test.ts',
    'src/random.test.ts',
    'src/mock-exams.test.ts',
    'src/compliance.test.ts',
    'src/history.test.ts',
    'src/commands.test.ts',
    'src/study-command.test.ts',
    'web/lib/documents.test.ts',
    'web/lib/paths.test.ts',
    'web/lib/quiz-controller.test.ts',
    'web/lib/quiz-results.test.ts',
    'web/lib/quiz-session.test.ts',
    'web/lib/quiz-view.test.ts',
    'docs/08-study-cli.md',
    'docs/09-regulatory-index.md',
    'docs/10-flight-training-syllabus.md',
    'docs/11-registration-scenarios.md',
    'docs/12-operational-compliance.md',
    'docs/13-github-pages.md',
    'sops/README.md',
    'sops/photography-video.md',
    'sops/mapping-photogrammetry.md',
    'sops/infrastructure-inspection.md',
    'sops/construction-real-estate.md',
    'sops/agriculture.md',
    'sops/public-safety.md',
    'validation/Test-AcsCoverage.ps1',
    'validation/Test-MockExams.ps1',
    'tools/Update-AcsExerciseMappings.ps1',
    'tools/Update-AcsCardMappings.ps1',
    'tools/Build-QuestionBank.ps1'
    'tools/Build-MockExamDocs.ps1'
    'astro.config.ts'
    '.github/workflows/deploy-pages.yml'
    'web/pages/index.astro'
    'web/pages/study.astro'
    'web/pages/exam.astro'
    'web/scripts/quiz-app.ts'
    'tools/validate-site.ts'
    'tools/serve-site.ts'
    'tools/run-e2e.ts'
    'playwright.config.ts'
    'vitest.config.ts'
    'e2e/navigation.spec.ts'
    'e2e/quiz.spec.ts'
    'web/layouts/BaseLayout.astro'
    'web/components/SiteHeader.astro'
    'web/components/SiteFooter.astro'
    'web/components/QuizApp.astro'
    'web/components/QuizSetup.astro'
    'web/components/QuizProgress.astro'
    'web/components/RecentResults.astro'
    'web/styles/global.css'
)

$failures = [System.Collections.Generic.List[string]]::new()
foreach ($relativePath in $requiredFiles) {
    $fullPath = Join-Path $projectRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        $failures.Add("Missing required artifact: $relativePath")
    }
}

$legacyModules = Get-ChildItem -LiteralPath $projectRoot -Recurse -File -Filter '*.mjs' |
    Where-Object { $_.FullName -notmatch '[\\/](node_modules|dist|site-dist)[\\/]' }
foreach ($legacyModule in $legacyModules) {
    $relativeModule = [System.IO.Path]::GetRelativePath($projectRoot, $legacyModule.FullName)
    $failures.Add("Legacy .mjs source is not permitted: $relativeModule")
}

$sourceFiles = Get-ChildItem -LiteralPath $projectRoot -Recurse -File |
    Where-Object {
        $_.Extension -in @('.ts', '.astro', '.js') -and
        $_.FullName -notmatch '[\\/](node_modules|coverage|dist|dist-cli|site-dist)[\\/]'
    }
foreach ($sourceFile in $sourceFiles) {
    $lineCount = @(Get-Content -LiteralPath $sourceFile.FullName).Count
    if ($lineCount -gt 350) {
        $relativeSource = [System.IO.Path]::GetRelativePath($projectRoot, $sourceFile.FullName)
        $failures.Add("Source file exceeds 350 physical lines: $relativeSource ($lineCount)")
    }
}

$coveredModules = @(
    Get-ChildItem -LiteralPath (Join-Path $projectRoot 'src') -File -Filter '*.ts' |
        Where-Object { $_.Name -notlike '*.test.ts' -and $_.Name -notin @('cli.ts', 'types.ts') }
    Get-ChildItem -LiteralPath (Join-Path $projectRoot 'web/lib') -File -Filter '*.ts' |
        Where-Object { $_.Name -notlike '*.test.ts' }
)
foreach ($module in $coveredModules) {
    $testPath = [System.IO.Path]::ChangeExtension($module.FullName, '.test.ts')
    if (-not (Test-Path -LiteralPath $testPath -PathType Leaf)) {
        $relativeModule = [System.IO.Path]::GetRelativePath($projectRoot, $module.FullName)
        $failures.Add("Covered module lacks an adjacent 1:1 test: $relativeModule")
    }
}

$colocatedTests = @(
    Get-ChildItem -LiteralPath (Join-Path $projectRoot 'src') -File -Filter '*.test.ts'
    Get-ChildItem -LiteralPath (Join-Path $projectRoot 'web/lib') -File -Filter '*.test.ts'
)
foreach ($testFile in $colocatedTests) {
    $moduleName = $testFile.Name -replace '\.test\.ts$', '.ts'
    $modulePath = Join-Path $testFile.DirectoryName $moduleName
    if (-not (Test-Path -LiteralPath $modulePath -PathType Leaf)) {
        $relativeTest = [System.IO.Path]::GetRelativePath($projectRoot, $testFile.FullName)
        $failures.Add("Colocated test lacks a 1:1 production module: $relativeTest")
    }
}

$legacyUnitTests = Get-ChildItem -LiteralPath (Join-Path $projectRoot 'test') -Recurse -File -Filter '*.test.ts' -ErrorAction SilentlyContinue
foreach ($legacyTest in $legacyUnitTests) {
    $relativeTest = [System.IO.Path]::GetRelativePath($projectRoot, $legacyTest.FullName)
    $failures.Add("Unit test is not colocated with its module: $relativeTest")
}

$markdownFiles = Get-ChildItem -LiteralPath $projectRoot -Recurse -File -Filter '*.md' |
    Where-Object { $_.FullName -notmatch '[\\/](node_modules|dist)[\\/]' }
$linkPattern = [regex]'\[[^\]]+\]\(([^)]+)\)'
foreach ($file in $markdownFiles) {
    $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
    foreach ($match in $linkPattern.Matches($content)) {
        $target = $match.Groups[1].Value.Trim()
        if ($target -match '^(https?://|mailto:|#)') { continue }
        $targetWithoutAnchor = ($target -split '#', 2)[0]
        if ([string]::IsNullOrWhiteSpace($targetWithoutAnchor)) { continue }
        $decodedTarget = [uri]::UnescapeDataString($targetWithoutAnchor)
        $resolvedTarget = Join-Path $file.DirectoryName $decodedTarget
        if (-not (Test-Path -LiteralPath $resolvedTarget)) {
            $relativeFile = $file.FullName.Substring($projectRoot.Length).TrimStart('\')
            $failures.Add("Broken local link in ${relativeFile}: $target")
        }
    }
}

$cardsPath = Join-Path $projectRoot 'study/study-cards.md'
if (Test-Path -LiteralPath $cardsPath) {
    $cards = Get-Content -LiteralPath $cardsPath -Raw -Encoding UTF8
    $cardIds = [regex]::Matches($cards, '(?m)^### ([A-Z]+-[0-9]{2})\b') |
        ForEach-Object { $_.Groups[1].Value }
    if ($cardIds.Count -lt 60) {
        $failures.Add("Study deck has $($cardIds.Count) cards; expected at least 60.")
    }
    $duplicates = $cardIds | Group-Object | Where-Object Count -gt 1
    foreach ($duplicate in $duplicates) {
        $failures.Add("Duplicate study-card ID: $($duplicate.Name)")
    }
    foreach ($areaPrefix in @('UA.I.', 'UA.II.', 'UA.III.', 'UA.IV.', 'UA.V.')) {
        if ($cards -notmatch [regex]::Escape($areaPrefix)) {
            $failures.Add("Study deck lacks ACS Area mapping: $areaPrefix")
        }
    }
}

$trackerPath = Join-Path $projectRoot 'trackers/acs-progress.csv'
if (Test-Path -LiteralPath $trackerPath) {
    $trackerRows = Import-Csv -LiteralPath $trackerPath
    $expectedTasks = @(
        'UA.I.A','UA.I.B','UA.I.C','UA.I.D','UA.I.E','UA.I.F',
        'UA.II.A','UA.II.B','UA.III.A','UA.III.B','UA.IV.A',
        'UA.V.A','UA.V.B','UA.V.C','UA.V.D','UA.V.E','UA.V.F'
    )
    foreach ($task in $expectedTasks) {
        if ($task -notin $trackerRows.'ACS prefix') {
            $failures.Add("ACS tracker lacks Task: $task")
        }
    }
}

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Output "PASS: $($requiredFiles.Count) required artifacts present."
Write-Output "PASS: $($markdownFiles.Count) Markdown files checked for local-link integrity."
Write-Output "PASS: $($cardIds.Count) unique ACS-mapped study cards found across all five Areas."
Write-Output 'PASS: All 17 ACS Tasks are present in the progress tracker.'
