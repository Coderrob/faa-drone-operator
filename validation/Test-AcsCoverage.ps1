$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$inventory = @(Import-Csv -LiteralPath (Join-Path $projectRoot 'data/acs-elements.csv'))
$questions = Get-Content -LiteralPath (Join-Path $projectRoot 'data/questions.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$errors = [System.Collections.Generic.List[string]]::new()

if ($inventory.Count -ne 176) {
    $errors.Add("ACS inventory contains $($inventory.Count) rows; FAA-S-ACS-10B has 176 parent/sub-element rows.")
}

foreach ($duplicate in ($inventory.code | Group-Object | Where-Object Count -gt 1)) {
    $errors.Add("Duplicate ACS inventory code: $($duplicate.Name)")
}

$requiredColumns = @('code','area','task','requirement','acs_page','primary_references','lesson','card_or_question','exercise','status')
foreach ($column in $requiredColumns) {
    if ($inventory.Count -eq 0 -or $column -notin $inventory[0].PSObject.Properties.Name) {
        $errors.Add("Missing ACS inventory column: $column")
    }
}

$inventoryCodes = [System.Collections.Generic.HashSet[string]]::new([string[]]$inventory.code, [StringComparer]::Ordinal)
foreach ($question in $questions) {
    if (-not $inventoryCodes.Contains([string]$question.acsCode)) {
        $errors.Add("Question $($question.id) references unknown ACS code $($question.acsCode)")
    }
}

$knownCards = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
$coreCards = Get-Content -LiteralPath (Join-Path $projectRoot 'study/study-cards.md') -Raw -Encoding UTF8
foreach ($match in [regex]::Matches($coreCards, '(?m)^### ([A-Z]+-[0-9]{2})\b')) {
    [void]$knownCards.Add($match.Groups[1].Value)
}
$supplementalCards = Get-Content -LiteralPath (Join-Path $projectRoot 'study/supplemental-element-cards.md') -Raw -Encoding UTF8
foreach ($match in [regex]::Matches($supplementalCards, '(?m)^\| (SUP-UA-[A-Za-z0-9-]+) /')) {
    [void]$knownCards.Add($match.Groups[1].Value)
}
foreach ($question in $questions) { [void]$knownCards.Add([string]$question.id) }

$exerciseText = Get-Content -LiteralPath (Join-Path $projectRoot 'study/worked-exercises.md') -Raw -Encoding UTF8
$knownExercises = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
foreach ($match in [regex]::Matches($exerciseText, '(?m)^## (EX-[A-Z]+-[0-9]{2})\b')) {
    [void]$knownExercises.Add($match.Groups[1].Value)
}

foreach ($row in $inventory) {
    foreach ($cardId in ([string]$row.card_or_question -split '\|')) {
        if (-not [string]::IsNullOrWhiteSpace($cardId) -and -not $knownCards.Contains($cardId)) {
            $errors.Add("$($row.code) references missing card/question: $cardId")
        }
    }
    foreach ($exerciseId in ([string]$row.exercise -split '\|')) {
        if (-not [string]::IsNullOrWhiteSpace($exerciseId) -and -not $knownExercises.Contains($exerciseId)) {
            $errors.Add("$($row.code) references missing exercise: $exerciseId")
        }
    }
    $lessonFile = ([string]$row.lesson -split '#', 2)[0]
    if (-not [string]::IsNullOrWhiteSpace($lessonFile) -and
        -not (Test-Path -LiteralPath (Join-Path $projectRoot $lessonFile) -PathType Leaf)) {
        $errors.Add("$($row.code) references missing lesson file: $lessonFile")
    }
}

$missingLesson = @($inventory | Where-Object { [string]::IsNullOrWhiteSpace($_.lesson) })
$missingCard = @($inventory | Where-Object { [string]::IsNullOrWhiteSpace($_.card_or_question) })
$missingExercise = @($inventory | Where-Object { [string]::IsNullOrWhiteSpace($_.exercise) })
$notComplete = @($inventory | Where-Object { $_.status -ne 'complete' })
if ($missingLesson.Count -gt 0) { $errors.Add("$($missingLesson.Count) ACS rows lack a lesson mapping.") }
if ($missingCard.Count -gt 0) { $errors.Add("$($missingCard.Count) ACS rows lack a card/question mapping.") }
if ($missingExercise.Count -gt 0) { $errors.Add("$($missingExercise.Count) ACS rows lack an exercise mapping.") }
if ($notComplete.Count -gt 0) { $errors.Add("$($notComplete.Count) ACS rows have not passed complete-coverage validation.") }

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Output 'PASS: all 176 ACS parent/sub-elements have complete instructional mappings.'
