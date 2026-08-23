$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$path = Join-Path $projectRoot 'data/acs-elements.csv'
$rows = @(Import-Csv -LiteralPath $path)

function Exercise-For([string]$code) {
    switch -Regex ($code) {
        '^UA\.II\.A\.' { return 'EX-CHART-01|EX-CHART-02' }
        '^UA\.II\.B\.' { return 'EX-AIRSPACE-03|EX-NIGHT-01' }
        '^UA\.III\.A\.K2' { return 'EX-WX-01' }
        '^UA\.III\.A\.K3' { return 'EX-WX-02' }
        '^UA\.III\.' { return 'EX-WX-01|EX-WX-02|EX-WX-03' }
        '^UA\.IV\.' { return 'EX-PERF-01|EX-WX-03' }
        '^UA\.V\.A\.' { return 'EX-COMMS-01|EX-AIRPORT-01' }
        '^UA\.V\.B\.' { return 'EX-AIRPORT-01|EX-RUNWAY-01' }
        '^UA\.V\.C\.' { return 'EX-NIGHT-01|EX-ADM-01' }
        '^UA\.V\.D\.' { return 'EX-ADM-01' }
        '^UA\.V\.E\.' { return 'EX-NIGHT-01|EX-ADM-01' }
        '^UA\.V\.F\.' { return 'EX-NIGHT-01' }
        '^UA\.I\.B\.K(16|18|19|21)' { return 'EX-CHART-01|EX-CHART-02|EX-AIRSPACE-03' }
        '^UA\.I\.B\.K(24|25)' { return 'EX-NIGHT-01' }
        '^UA\.I\.E\.' { return 'EX-ADM-01' }
        '^UA\.I\.F\.' { return 'EX-ADM-01' }
        default { return 'EX-ADM-01' }
    }
}

foreach ($row in $rows) {
    $row.exercise = Exercise-For $row.code
    if (-not [string]::IsNullOrWhiteSpace($row.lesson) -and
        -not [string]::IsNullOrWhiteSpace($row.card_or_question)) {
        $row.status = 'mapped'
    }
}

$rows | Export-Csv -LiteralPath $path -NoTypeInformation -Encoding UTF8
Write-Output "Mapped exercises for $($rows.Count) ACS rows."
