$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$path = Join-Path $projectRoot 'data/acs-elements.csv'
$rows = @(Import-Csv -LiteralPath $path)
$updated = 0

foreach ($row in $rows) {
    if ([string]::IsNullOrWhiteSpace($row.card_or_question)) {
        $row.card_or_question = "SUP-$($row.code.Replace('.', '-'))"
        $updated += 1
    }
    if (-not [string]::IsNullOrWhiteSpace($row.lesson) -and
        -not [string]::IsNullOrWhiteSpace($row.card_or_question) -and
        -not [string]::IsNullOrWhiteSpace($row.exercise)) {
        $row.status = 'complete'
    }
}

$rows | Export-Csv -LiteralPath $path -NoTypeInformation -Encoding UTF8
Write-Output "Added $updated supplemental card mappings; evaluated $($rows.Count) rows."
