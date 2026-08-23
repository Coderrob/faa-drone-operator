$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$inventory = @(Import-Csv (Join-Path $root 'data/acs-elements.csv'))
$meta = @{}; foreach ($row in $inventory) { $meta[$row.code] = $row }
$overridePath = Join-Path $root 'data/distractor-overrides.json'
$overrides = @{}
if (Test-Path $overridePath) {
    foreach ($entry in (Get-Content $overridePath -Raw -Encoding UTF8 | ConvertFrom-Json)) {
        $overrides[$entry.id] = $entry
    }
}
$cards = [System.Collections.Generic.List[object]]::new()

$sectionByCard = @{
    'REG-01'='107.3'; 'REG-02'='107.3'; 'REG-03'='107.9'; 'REG-04'='107.7';
    'REG-05'='107.13'; 'REG-06'='107.15'; 'REG-07'='107.12'; 'REG-08'='107.21';
    'REG-09'='107.23'; 'REG-10'='107.25'; 'REG-11'='107.27'; 'REG-12'='107.29';
    'REG-13'='107.31'; 'REG-14'='107.33'; 'REG-15'='107.35'; 'REG-16'='107.37';
    'REG-17'='107.41'; 'REG-18'='107.49'; 'REG-19'='107.51'; 'REG-20'='107.51';
    'REG-21'='107.205'; 'REG-22'='107.61'; 'REG-23'='107.65'; 'REG-24'='107.200';
    'REG-25'='107.110'; 'REG-26'='107.115'; 'REG-27'='107.140'; 'REG-28'='107.39';
    'REG-29'='89.305'; 'REG-30'='89.115'; 'REG-31'='89.115'
}

function Get-Citations($card, $metadata) {
    $result = [System.Collections.Generic.List[object]]::new()
    $result.Add([ordered]@{label='FAA-S-ACS-10B';url='https://www.faa.gov/sites/faa.gov/files/training_testing/testing/acs/uas_acs.pdf';locator="$($card.code), page $($metadata.acs_page); $($metadata.primary_references)"})
    if ($sectionByCard.ContainsKey($card.id)) {
        $section = $sectionByCard[$card.id]
        $result.Add([ordered]@{label="14 CFR $section";url="https://www.ecfr.gov/current/title-14/section-$section";locator="Controlling section for $($card.id)"})
    }
    $references = [string]$metadata.primary_references
    foreach ($part in @('47','48','71','89','107')) {
        if ($references -match "(?i)Part(s)?[^;]*\b$part\b") {
            $result.Add([ordered]@{label="14 CFR Part $part";url="https://www.ecfr.gov/current/title-14/part-$part";locator=$references})
        }
    }
    if ($references -match 'AC 107-2') {$result.Add([ordered]@{label='FAA AC 107-2A';url='https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_107-2A.pdf';locator=$references})}
    if ($references -match '\bAIM\b') {$result.Add([ordered]@{label='FAA Aeronautical Information Manual';url='https://www.faa.gov/air_traffic/publications/atpubs/aim_html/';locator=$references})}
    if ($references -match 'FAA-H-8083') {$result.Add([ordered]@{label='FAA Aviation Handbooks and Manuals';url='https://www.faa.gov/regulations_policies/handbooks_manuals/aviation';locator=$references})}
    return @($result)
}

$core = Get-Content (Join-Path $root 'study/study-cards.md') -Raw -Encoding UTF8
$pattern = '(?ms)^###\s+([A-Z]+-[0-9]{2})\s+[^\r\n]*?(UA\.[IVX]+\.[A-F]\.K[0-9]+[a-z]?)[^\r\n]*$.*?^\*\*Q:\*\*\s*(.*?)\r?\n\r?\n\*\*A:\*\*\s*(.*?)(?=^###|^##|\z)'
foreach ($m in [regex]::Matches($core, $pattern)) {
    $cards.Add([pscustomobject]@{ id=$m.Groups[1].Value; code=$m.Groups[2].Value; prompt=(($m.Groups[3].Value-replace '\s+',' ').Trim()); answer=(($m.Groups[4].Value-replace '\s+',' ').Trim()) })
}
foreach ($line in (Get-Content (Join-Path $root 'study/supplemental-element-cards.md') -Encoding UTF8)) {
    if ($line -match '^\| (SUP-UA-[A-Za-z0-9-]+) / (UA\.[IVX]+\.[A-F]\.K[0-9]+[a-z]?) \| (.*?) \| (.*?) \|$') {
        $cards.Add([pscustomobject]@{ id=$Matches[1]; code=$Matches[2]; prompt=$Matches[3].Trim(); answer=$Matches[4].Trim() })
    }
}
if ($cards.Count -ne 150) { throw "Expected 150 source cards; found $($cards.Count)." }

$bank = [System.Collections.Generic.List[object]]::new()
foreach ($card in $cards) {
    $parts=$card.code.Split('.'); $area=$parts[1]; $task=$parts[2]
    $peers=@($cards|Where-Object { $_.id-ne$card.id -and $_.code.StartsWith("UA.$area.$task.") -and $_.answer-ne$card.answer })
    if($peers.Count-lt3){$peers=@($cards|Where-Object{$_.id-ne$card.id-and$_.code.StartsWith("UA.$area.")-and$_.answer-ne$card.answer})}
    # String.GetHashCode() is process-randomized on modern .NET. Use a stable
    # character-weighted checksum so rebuilding produces byte-stable choices.
    $start = 0
    for ($j = 0; $j -lt $card.id.Length; $j += 1) {
        $start = ($start + (($j + 1) * [int][char]$card.id[$j])) % 2147483647
    }
    $wrong=[System.Collections.Generic.List[string]]::new()
    for($i=0;$i-lt$peers.Count-and$wrong.Count-lt3;$i+=1){$a=[string]$peers[($start+$i)%$peers.Count].answer;if(!$wrong.Contains($a)){$wrong.Add($a)}}
    if($wrong.Count-ne3){throw "Insufficient distractors for $($card.id)"}; $m=$meta[$card.code]
    $questionId = "CARD-$($card.id)"
    $choices = @($card.answer,$wrong[0],$wrong[1],$wrong[2])
    $review = 'generated-peer-answer; human-review-required'
    if ($overrides.ContainsKey($questionId)) {
        $override = $overrides[$questionId]
        if ($override.choices.Count -ne 4 -or @($override.choices | Sort-Object -Unique).Count -ne 4) { throw "Invalid override for $questionId" }
        $choices = @($override.choices)
        $review = [string]$override.review.status
    }
    $bank.Add([ordered]@{id=$questionId;sourceCardId=$card.id;acsCode=$card.code;area=$area;task=$task;topic=$m.requirement;difficulty=2;critical=$false;prompt=$card.prompt;choices=$choices;correctIndex=0;explanation="$($card.answer) This assesses $($m.requirement).";remediation="Review $($m.lesson) and $($m.exercise).";citations=@(Get-Citations $card $m);original=$true;distractorReview=$review})
}
$bank|ConvertTo-Json -Depth 8|Set-Content (Join-Path $root 'data/card-questions.json') -Encoding UTF8

$releaseStatus = if (@($bank | Where-Object distractorReview -ne 'approved').Count -eq 0) { 'release-reviewed' } else { 'draft-distractors-require-human-review' }
function Form($id,$counts,$offset){$ids=[System.Collections.Generic.List[string]]::new();foreach($area in @('I','II','III','IV','V')){$pool=@($bank|Where-Object area -eq $area);for($i=0;$i-lt$counts[$area];$i+=1){$ids.Add($pool[($i+$offset)%$pool.Count].id)}};[ordered]@{id=$id;title="Original Part 107 Mock Exam $id";timeLimitMinutes=120;passingPercent=70;questionIds=@($ids);distribution=$counts;status=$releaseStatus}}
$forms=@((Form 'A' @{I=12;II=12;III=8;IV=5;V=23} 0),(Form 'B' @{I=14;II=10;III=9;IV=5;V=22} 17))
$forms|ConvertTo-Json -Depth 6|Set-Content (Join-Path $root 'data/mock-exams.json') -Encoding UTF8
Write-Output "Built $($bank.Count) questions and two 60-question forms."
