use std::process::Command;

#[tauri::command]
fn print_receipt(html: String) -> Result<(), String> {
    let temp_dir = std::env::temp_dir();
    let file_path = temp_dir.join("rkeeper_receipt.html");
    std::fs::write(&file_path, &html).map_err(|e| e.to_string())?;

    let script = r#"
Add-Type -AssemblyName System.Drawing

$html = Get-Content (Join-Path $env:TEMP "rkeeper_receipt.html") -Raw -Encoding UTF8
$html = $html -replace '<br\s*/?>', "`n"
$html = $html -replace '><', '> <'
$text = [regex]::Replace($html, '<[^>]+>', '')
$text = [System.Net.WebUtility]::HtmlDecode($text).Trim()
$text = $text -replace '✓', ''
$lines = @($text -split "`r?`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" })

$items = New-Object System.Collections.Generic.List[object]
$idx = 0
foreach ($l in $lines) {
    $size = 11.0
    $bold = $true
    $center = $false
    if ($idx -eq 0) {
        $size = 13.0; $center = $true
    } elseif ($l -match 'ÖDƏNİŞ QƏBZİ|SİFARİŞ ÇEKİ') {
        $center = $true
    } elseif ($l -eq 'Nuş olsun!' -or $l -eq 'Yenidən gözləyirik' -or $l -eq 'ÖDƏNİLİB') {
        $center = $true
    } elseif ($l -match '^CƏMİ') {
        $size = 12.5
    }
    $items.Add([pscustomobject]@{ Text = $l; Size = $size; Bold = $bold; Center = $center })
    $idx++
}

$doc = New-Object System.Drawing.Printing.PrintDocument
$doc.OriginAtMargins = $false
$doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(8, 10, 10, 10)
$doc.add_PrintPage({
    param($sender, $e)
    $brush = [System.Drawing.Brushes]::Black
    $y = [Single]$e.MarginBounds.Y
    foreach ($it in $items) {
        $style = [System.Drawing.FontStyle]::Bold
        $font = New-Object System.Drawing.Font("Courier New", [float]$it.Size, $style)
        $w = $e.Graphics.MeasureString($it.Text, $font).Width
        if ($it.Center) {
            $x = [Single]($e.MarginBounds.X + (($e.MarginBounds.Width - $w) / 2))
        } else {
            $x = [Single]$e.MarginBounds.X
        }
        $e.Graphics.DrawString($it.Text, $font, $brush, $x, $y)
        $y += [Single]($font.GetHeight($e.Graphics) * 1.4)
    }
})
$doc.Print()
"#;

    let script_path = temp_dir.join("rkeeper_print.ps1");
    std::fs::write(&script_path, script).map_err(|e| e.to_string())?;

    let output = Command::new("powershell")
        .args([
            "-NoProfile",
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
