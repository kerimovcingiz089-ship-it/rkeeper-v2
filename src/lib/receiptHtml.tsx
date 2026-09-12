import type { ReceiptData } from "../components/ui/Receipt";
import { fmtMoney, fmtDateTime } from "./utils";

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string): string {
  return `<div class="flex justify-between py-0-5"><span class="c-gray c-gray-500">${label}</span><span class="bold">${value}</span></div>`;
}

function sep(): string {
  return `<div class="sep"></div>`;
}

/**
 * Receipt HTML-i yalnizca string birlestirerek qurur. React/DOM istifade etmir,
 * buna gore WebView-da hec vaxt crash etmez.
 */
export function buildReceiptHtml(data: ReceiptData): string {
  const { date, time } = fmtDateTime(data.timestamp);
  const itemCount = data.items.reduce((s, li) => s + li.qty, 0);

  let body = `<div class="r">
  <div class="h1">${esc(data.restaurantName)}</div>
  <div class="h2">${data.paid ? "ÖDƏNİŞ QƏBZİ" : "SİFARİŞ ÇEKİ"}</div>
  ${sep()}
  ${row("Tarix", esc(date))}
  ${row("Saat", esc(time))}
  ${row(data.isTakeaway ? "Sifariş" : "Masa", esc(data.tableName))}
  ${row("Çek №", esc("#" + String(data.receiptNo).padStart(5, "0")))}
  ${row("Kassir", esc(data.cashier))}
  ${sep()}`;

  if (data.items.length > 0) {
    for (const li of data.items) {
      body += `
  <div class="it">
    <div class="bold">${esc(li.name)}</div>
    <div class="flex justify-between c-gray-600"><span>${li.qty} × ${esc(fmtMoney(li.price, data.currency))}</span><span>${esc(fmtMoney(li.price * li.qty, data.currency))}</span></div>
  </div>`;
    }
  } else {
    body += `\n  <div class="empty">Məhsul yoxdur</div>`;
  }

  body += `
  ${sep()}
  ${row("Məhsul sayı", `${itemCount} ədəd`)}
  <div class="flex justify-between total"><span>CƏMİ</span><span>${esc(fmtMoney(data.total, data.currency))}</span></div>`;

  if (data.paid) {
    body += `\n  <div class="flex justify-between py-0-5"><span class="c-gray-500">Ödəniş növü</span><span class="bold">${data.paymentMethod === "cash" ? "Nağd" : "Kart"}</span></div>`;
    body += `\n  <div class="paid">ÖDƏNİLİB ✓</div>`;
  } else {
    body += `\n  <div class="notpaid">Ödəniş hələ qəbul olunmayıb</div>`;
  }

  body += `
  ${sep()}
  <div class="foot">Nuş olsun!<br/>Yenidən gözləyirik</div>
</div>`;

  let textLines: string[] = [];
  textLines.push(data.restaurantName);
  textLines.push(data.paid ? "ÖDƏNİŞ QƏBZİ" : "SİFARİŞ ÇEKİ");
  textLines.push("--------------------------------");
  textLines.push(`Tarix    ${esc(date)}`);
  textLines.push(`Saat     ${esc(time)}`);
  textLines.push(`${data.isTakeaway ? "Sifariş" : "Masa"}    ${esc(data.tableName)}`);
  textLines.push(`Çek №    ${esc("#" + String(data.receiptNo).padStart(5, "0"))}`);
  textLines.push(`Kassir   ${esc(data.cashier)}`);
  textLines.push("--------------------------------");
  for (const li of data.items) {
    textLines.push(esc(li.name));
    textLines.push(`  ${li.qty} x ${esc(fmtMoney(li.price, data.currency))}   ${esc(fmtMoney(li.price * li.qty, data.currency))}`);
  }
  if (data.items.length === 0) textLines.push("Məhsul yoxdur");
  textLines.push("--------------------------------");
  textLines.push(`Məhsul sayı   ${itemCount} ədəd`);
  textLines.push(`CƏMİ   ${esc(fmtMoney(data.total, data.currency))}`);
  if (data.paid) {
    textLines.push(`Ödəniş növü   ${data.paymentMethod === "cash" ? "Nağd" : "Kart"}`);
    textLines.push("ÖDƏNİLİB");
  } else {
    textLines.push("Ödəniş hələ qəbul olunmayıb");
  }
  textLines.push("--------------------------------");
  textLines.push("Nuş olsun!");
  textLines.push("Yenidən gözləyirik");

  const preText = textLines.join("\n");
  const escPre = preText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#fff;font-family:'Courier New',monospace;font-size:12.5px;color:#1a1a1a}
.r{width:280px;padding:12px;margin:0 auto}
.h1{text-align:center;font-weight:800;font-size:15px;text-transform:uppercase;letter-spacing:1px}
.h2{text-align:center;font-size:10.5px;letter-spacing:2.5px;color:#6b7280;margin:4px 0 12px}
.sep{border-top:1px dashed #9ca3af;margin:8px 0}
.flex{display:flex}
.justify-between{justify-content:space-between}
.py-0-5{padding:2px 0}
.bold{font-weight:700}
.c-gray{color:#6b7280}
.c-gray-500{color:#6b7280}
.c-gray-600{color:#4b5563}
.it{margin-bottom:6px}
.empty{text-align:center;color:#9ca3af;font-size:12px}
.total{font-weight:800;font-size:16px;padding:4px 0}
.paid{text-align:center;border:2px solid #16a34a;color:#16a34a;font-weight:800;font-size:12px;letter-spacing:2px;border-radius:6px;padding:8px 0;margin-top:12px;transform:rotate(-1deg)}
.notpaid{text-align:center;font-size:12px;color:#9ca3af;font-style:italic;margin-top:8px}
.foot{text-align:center;font-size:12px;color:#6b7280;margin-top:8px}
</style></head><body>${body.replace(/\n\s*/g, "\n")}
<pre id="rectext" style="display:none">${escPre}</pre>
</body></html>`;
}