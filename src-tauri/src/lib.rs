use std::process::Command;

#[tauri::command]
fn print_receipt(html: String) -> Result<(), String> {
    let temp_dir = std::env::temp_dir();
    let file_path = temp_dir.join("rkeeper_receipt.html");
    std::fs::write(&file_path, &html).map_err(|e| e.to_string())?;

    let script = r#"
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

$html = Get-Content (Join-Path $env:TEMP "rkeeper_receipt.html") -Raw -Encoding UTF8

function Print-TextFallback {
    $text = [regex]::Replace($html, '<[^>]+>', '')
    $text = [System.Net.WebUtility]::HtmlDecode($text).Trim() -replace ([char]0x2713).ToString(), ''
    $lines = @($text -split "`r?`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" })
    $doc = New-Object System.Drawing.Printing.PrintDocument
    $doc.add_PrintPage({
        param($sender, $e)
        $y = [Single]$e.MarginBounds.Y
        foreach ($line in $lines) {
            $font = New-Object System.Drawing.Font("Courier New", 11, [System.Drawing.FontStyle]::Bold)
            $e.Graphics.DrawString($line, $font, [System.Drawing.Brushes]::Black, [Single]$e.MarginBounds.X, $y)
            $y += [float]$font.GetHeight($e.Graphics) * 1.3
        }
    })
    $doc.Print()
}

function Print-Image {
    $full = "<!DOCTYPE html><html><head><meta charset=""utf-8""><style>html,body{margin:0;padding:0}</style></head><body style=""margin:0;padding:0"">" + $html + "</body></html>"

    $wb = New-Object System.Windows.Forms.WebBrowser
    $wb.ScrollBarsEnabled = $false
    $wb.ScriptErrorsSuppressed = $true
    $wb.Width = 500
    $wb.Height = 1000
    $null = $wb.Handle
    $wb.DocumentText = $full

    $t = 0
    while (($wb.Document -eq $null -or $wb.Document.Body -eq $null -or $wb.ReadyState -ne "Complete") -and $t -lt 400) {
        [System.Windows.Forms.Application]::DoEvents()
        Start-Sleep -Milliseconds 25
        $t++
    }

    $target = $null
    foreach ($e in $wb.Document.All) {
        $cn = $e.GetAttribute("className")
        if ($cn -and $cn.ToString().Contains("w-[280px]")) { $target = $e; break }
    }
    if ($target) {
        $elLeft = [int]$target.GetAttribute("offsetLeft")
        $elTop  = [int]$target.GetAttribute("offsetTop")
        $elW    = [int]$target.GetAttribute("offsetWidth")
        $elH    = [int]$target.GetAttribute("offsetHeight")
    } else {
        $body = $wb.Document.Body.ScrollRectangle
        $elLeft = 0; $elTop = 0; $elW = $body.Width; $elH = $body.Height
    }

    $fullW = [int]$wb.Document.Body.ScrollRectangle.Width
    $fullH = [int]$wb.Document.Body.ScrollRectangle.Height
    if ($fullW -lt $elLeft + $elW) { $fullW = $elLeft + $elW }
    if ($fullH -lt $elTop + $elH) { $fullH = $elTop + $elH }

    $fullBmp = New-Object System.Drawing.Bitmap($fullW, $fullH)
    $fullBmp.SetResolution(96, 96)
    $wb.DrawToBitmap($fullBmp, (New-Object System.Drawing.Rectangle(0, 0, $fullW, $fullH)))

    $bmp = New-Object System.Drawing.Bitmap($elW, $elH)
    $bmp.SetResolution(96, 96)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::White)
    $g.DrawImage($fullBmp,
        (New-Object System.Drawing.Rectangle(0, 0, $elW, $elH)),
        (New-Object System.Drawing.Rectangle($elLeft, $elTop, $elW, $elH)),
        [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $fullBmp.Dispose()

    $doc = New-Object System.Drawing.Printing.PrintDocument
    $doc.OriginAtMargins = $false
    $doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(5, 5, 5, 5)
    $doc.add_PrintPage({
        param($sender, $e)
        $iw = $bmp.Width
        $ih = $bmp.Height
        $pw = $iw * (100.0 / 96.0)
        $ph = $ih * (100.0 / 96.0)
        $maxW = [Single]$e.MarginBounds.Width
        $maxH = [Single]$e.MarginBounds.Height
        $scaleX = $maxW / $pw
        $scaleY = $maxH / $ph
        $scale = [Math]::Min($scaleX, $scaleY)
        if ($scale -gt 1) { $scale = 1 }
        $dw = [int]($pw * $scale)
        $dh = [int]($ph * $scale)
        $dx = [int]($e.MarginBounds.X + (($maxW - $dw) / 2))
        $dy = [int]($e.MarginBounds.Y + (($maxH - $dh) / 2))
        $dest = New-Object System.Drawing.Rectangle($dx, $dy, $dw, $dh)
        $e.Graphics.DrawImage($bmp, $dest)
    })
    $doc.Print()
}

try {
    Print-Image
    Write-Output "PRINT_OK"
} catch {
    try {
        Print-TextFallback
        Write-Output "PRINT_FALLBACK_OK"
    } catch {
        Write-Error "Print error: $($_.Exception.Message)"
        exit 1
    }
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
