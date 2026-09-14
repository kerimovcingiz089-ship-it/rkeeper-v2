use std::process::Command;

#[tauri::command]
fn print_receipt(html: String) -> Result<(), String> {
    let temp_dir = std::env::temp_dir();
    let file_path = temp_dir.join("rkeeper_receipt.html");
    std::fs::write(&file_path, &html).map_err(|e| e.to_string())?;

    let script = r#"
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$html = Get-Content (Join-Path $env:TEMP "rkeeper_receipt.html") -Raw -Encoding UTF8
if ($html -match '(?s)<pre id="rectext"[^>]*>(.*?)</pre>') {
    $text = [System.Net.WebUtility]::HtmlDecode($Matches[1])
} else {
    $text = [regex]::Replace($html, '<[^>]+>', '')
}
$text = [System.Net.WebUtility]::HtmlDecode($text).Trim()
$text = $text -replace ([char]0x2713).ToString(), ''
$lines = @($text -split "`r?`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" })

$items = New-Object System.Collections.Generic.List[object]
foreach ($l in $lines) {
    $pipe = $l.IndexOf('|')
    $kind = if ($pipe -lt 0) { $l } else { $l.Substring(0, $pipe) }
    $rest = if ($pipe -lt 0) { '' } else { $l.Substring($pipe + 1) }
    $a = $rest
    $b = ''
    if ($kind -eq 'ROW' -or $kind -eq 'QTY' -or $kind -eq 'TOTAL') {
        $p = $rest.IndexOf('|')
        if ($p -ge 0) {
            $a = $rest.Substring(0, $p)
            $b = $rest.Substring($p + 1)
        }
    }
    $items.Add([pscustomobject]@{ K = $kind; A = $a; B = $b })
}

if ($items.Count -eq 0) { throw "Cek metni bosdur" }

$script:lineIndex = 0
$doc = New-Object System.Drawing.Printing.PrintDocument
$doc.OriginAtMargins = $false
$doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(8, 10, 10, 10)
$doc.add_PrintPage({
    param($sender, $e)
    $g = $e.Graphics
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $brush = [System.Drawing.Brushes]::Black
    $x = [Single]$e.MarginBounds.X
    $right = [Single]$e.MarginBounds.Right
    $y = [Single]$e.MarginBounds.Y
    $bottom = [Single]$e.MarginBounds.Bottom
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black)
    $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
    $pen.Width = 1.0
    while ($script:lineIndex -lt $items.Count -and $y -le $bottom) {
        $it = $items[$script:lineIndex]
        $kind = $it.K
        if ($kind -eq 'SEP') {
            $g.DrawLine($pen, $x, $y, $right, $y)
            $y += 6.0
            $script:lineIndex++
            continue
        }
        $size = 9.5
        $bold = $false
        $center = $false
        $italic = $false
        $rightAligned = $false
        $rightBold = $false
        switch ($kind) {
            'HEAD'  { $size = 14.0; $bold = $true; $center = $true }
            'SUB'   { $size = 8.5;  $center = $true }
            'ROW'   { $size = 9.5;  $rightAligned = $true }
            'ITEM'  { $size = 9.5;  $bold = $true }
            'QTY'   { $size = 9.5;  $rightAligned = $true }
            'TOTAL' { $size = 12.5; $bold = $true; $rightAligned = $true; $rightBold = $true }
            'PAID'  { $size = 9.5;  $bold = $true; $center = $true }
            'NOT'   { $size = 9.0;  $italic = $true; $center = $true }
            'FOOT'  { $size = 9.0;  $center = $true }
            'EMPTY' { $size = 9.0;  $center = $true }
        }
        if ($rightAligned -and $it.B -ne '') {
            $stL = if ($bold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
            $stR = if ($rightBold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
            $fL = New-Object System.Drawing.Font("Courier New", [float]$size, $stL)
            $fR = New-Object System.Drawing.Font("Courier New", [float]$size, $stR)
            $g.DrawString($it.A, $fL, $brush, $x, $y)
            $wR = $g.MeasureString($it.B, $fR).Width
            $g.DrawString($it.B, $fR, $brush, [Single]($right - $wR), $y)
        } elseif ($center) {
            $stC = if ($italic) { [System.Drawing.FontStyle]::Italic } elseif ($bold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
            $fC = New-Object System.Drawing.Font("Courier New", [float]$size, $stC)
            $wC = $g.MeasureString($it.A, $fC).Width
            $g.DrawString($it.A, $fC, $brush, [Single]($x + (($e.MarginBounds.Width - $wC) / 2)), $y)
        } else {
            $stN = if ($bold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
            $fN = New-Object System.Drawing.Font("Courier New", [float]$size, $stN)
            $g.DrawString($it.A, $fN, $brush, $x, $y)
        }
        $y += [Single]($size * 1.4)
        $script:lineIndex++
    }
    $e.HasMorePages = ($script:lineIndex -lt $items.Count)
})
try {
    $doc.Print()
} finally {
    if ($doc) { $doc.Dispose() }
}
"#;

    let script_path = temp_dir.join("rkeeper_print.ps1");
    let mut script_bytes = Vec::new();
    script_bytes.extend_from_slice(&[0xEF, 0xBB, 0xBF]);
    script_bytes.extend_from_slice(script.as_bytes());
    std::fs::write(&script_path, script_bytes).map_err(|e| e.to_string())?;

    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-STA",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            script_path.to_str().unwrap(),
        ])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        if !stderr.trim().is_empty() {
            return Err(format!("Çap xətası: {}", stderr));
        }
    }

    Ok(())
}

#[tauri::command]
fn download_update(url: String) -> Result<String, String> {
    let temp_dir = std::env::temp_dir();
    let file_path = temp_dir.join("rkeeper_update.exe");
    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            &format!(
                "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '{}' -OutFile '{}' -UseBasicParsing",
                url,
                file_path.to_string_lossy()
            ),
        ])
        .output()
        .map_err(|e| e.to_string())?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Yükləmə uğursuz oldu: {}", stderr));
    }
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn install_update(path: String) -> Result<(), String> {
    let ps = format!(
        "Start-Process -FilePath '{}' -ArgumentList '/S' -Verb RunAs -Wait",
        path.replace('\\', "\\\\").replace('\'', "''")
    );
    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", &ps])
        .output()
        .map_err(|e| e.to_string())?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        if !stderr.trim().is_empty() {
            return Err(format!("Quraşdırma xətası: {}", stderr));
        }
    }
    std::process::exit(0);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            print_receipt,
            download_update,
            install_update
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
