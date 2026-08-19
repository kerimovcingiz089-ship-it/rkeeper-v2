use std::process::Command;

#[tauri::command]
fn print_receipt(html: String) -> Result<(), String> {
    let temp_dir = std::env::temp_dir();
    let file_path = temp_dir.join("rkeeper_receipt.html");
    std::fs::write(&file_path, &html).map_err(|e| e.to_string())?;

    let script = r#"
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Printing

$html = Get-Content (Join-Path $env:TEMP "rkeeper_receipt.html") -Raw -Encoding UTF8
$text = [regex]::Replace($html, '<[^>]+>', '')
$text = [System.Net.WebUtility]::HtmlDecode($text).Trim()

$doc = New-Object System.Drawing.Printing.PrintDocument
$doc.add_PrintPage({
    param($sender, $e)
    $font = New-Object System.Drawing.Font("Courier New", 11)
    $brush = [System.Drawing.Brushes]::Black
    $point = New-Object System.Drawing.PointF($e.MarginBounds.X, $e.MarginBounds.Y)
    $e.Graphics.DrawString($text, $font, $brush, $point)
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
    Command::new(&path)
        .args(["/S"])
        .spawn()
        .map_err(|e| e.to_string())?;
    std::thread::spawn(|| {
        std::thread::sleep(std::time::Duration::from_secs(3));
        std::process::exit(0);
    });
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
