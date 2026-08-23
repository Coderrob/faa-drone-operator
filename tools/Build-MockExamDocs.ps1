$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$bank = Get-Content (Join-Path $root 'data/card-questions.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$forms = Get-Content (Join-Path $root 'data/mock-exams.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$byId = @{}
foreach ($question in $bank) { $byId[$question.id] = $question }

function Get-Permutation([string]$key) {
    $score = 0
    for ($i = 0; $i -lt $key.Length; $i += 1) { $score += ($i + 1) * [int][char]$key[$i] }
    $patterns = @(
        @(0, 1, 2, 3), @(1, 3, 0, 2), @(2, 0, 3, 1), @(3, 2, 1, 0),
        @(0, 2, 1, 3), @(1, 0, 3, 2), @(2, 3, 0, 1), @(3, 1, 2, 0)
    )
    return $patterns[$score % $patterns.Count]
}

foreach ($form in $forms) {
    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add("# $($form.title)")
    $lines.Add('')
    $lines.Add("Time limit: **$($form.timeLimitMinutes) minutes**. Passing score: **$($form.passingPercent)%**. Questions are original and mapped to FAA-S-ACS-10B; they are not actual FAA test questions.")
    $lines.Add('')
    $lines.Add('Record one answer per question. Do not consult the key until the timed attempt is complete.')
    $lines.Add('')
    $answers = [System.Collections.Generic.List[object]]::new()
    $number = 0
    foreach ($id in $form.questionIds) {
        $number += 1
        $question = $byId[$id]
        $permutation = @(Get-Permutation "$($form.id):$id")
        $correctPresented = [array]::IndexOf($permutation, [int]$question.correctIndex)
        $lines.Add("## $number. $($question.prompt)")
        $lines.Add('')
        for ($choice = 0; $choice -lt 4; $choice += 1) {
            $letter = [char](65 + $choice)
            $lines.Add("$letter. $($question.choices[$permutation[$choice]] )")
        }
        $lines.Add('')
        $answers.Add([pscustomobject]@{ number=$number; question=$question; letter=[char](65+$correctPresented) })
    }
    $lines.Add('# Answer key and remediation')
    $lines.Add('')
    foreach ($answer in $answers) {
        $question = $answer.question
        $citation = $question.citations[0]
        $lines.Add("## $($answer.number). $($answer.letter) - $($question.acsCode)")
        $lines.Add('')
        $lines.Add("**Rationale:** $($question.explanation)")
        $lines.Add('')
        $lines.Add("**Remediation:** $($question.remediation)")
        $lines.Add('')
        $lines.Add("**Source:** [$($citation.label)]($($citation.url)) - $($citation.locator)")
        $lines.Add('')
    }
    $output = Join-Path $root "study/mock-exam-$($form.id.ToLowerInvariant()).md"
    $lines | Set-Content $output -Encoding UTF8
    Write-Output "Built $output"
}
