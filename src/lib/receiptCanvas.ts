import type { ReceiptData } from "../components/ui/Receipt";
import { fmtMoney, fmtDateTime } from "./utils";

const SCREEN_W = 280;
const BASE_W = 576;
const DPR = 2;
const S = (BASE_W * DPR) / SCREEN_W;
const PAD = 20;
const CONTENT_W = SCREEN_W - PAD * 2;
const LH = (size: number) => size * 1.4;
const ROW_H = LH(12.5) + 4;
const ITEM_H = LH(12.5) + LH(12.5) + 6;
const SEP_H = 8 + 1 + 8;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawSep(ctx: CanvasRenderingContext2D, y: number) {
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(PAD + CONTENT_W, y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function computeHeight(data: ReceiptData): number {
  let y = PAD;
  y += LH(15);
  y += 4 + LH(10.5) + 12;
  y += SEP_H;
  y += 5 * ROW_H;
  y += SEP_H;
  y += data.items.length === 0 ? LH(12) : data.items.length * ITEM_H;
  y += SEP_H;
  y += ROW_H;
  y += 4 + LH(19) + 4;
  if (data.paid) {
    y += ROW_H + 12 + (2 + 8 + LH(12) + 8 + 2);
  } else {
    y += 8 + LH(12);
  }
  y += SEP_H;
  y += 8 + LH(12) + LH(12);
  y += PAD;
  return y;
}

export async function buildReceiptDataUrl(data: ReceiptData): Promise<string> {
  const h = computeHeight(data);
  const canvas = document.createElement("canvas");
  canvas.width = BASE_W * DPR;
  canvas.height = Math.ceil(h * S);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(S, S);
  ctx.textBaseline = "top";

  let y = PAD;

  // Title
  ctx.fillStyle = "#000";
  ctx.font = "900 15px Arial,sans-serif";
  const title = data.restaurantName.toUpperCase();
  const tw = ctx.measureText(title).width;
  ctx.fillText(title, PAD + (CONTENT_W - tw) / 2, y);
  y += LH(15);

  // Subtitle
  y += 4;
  ctx.fillStyle = "#000";
  ctx.font = "10.5px Arial,sans-serif";
  const sub = data.paid ? "ÖDƏNİŞ QƏBZİ" : "SİFARİŞ ÇEKİ";
  const sw = ctx.measureText(sub).width;
  ctx.fillText(sub, PAD + (CONTENT_W - sw) / 2, y);
  y += LH(10.5);
  y += 12;

  // Separator
  y += 8;
  drawSep(ctx, y);
  y += 1 + 8;

  // Rows helper
  const row = (label: string, value: string, boldValue = true) => {
    ctx.fillStyle = "#000";
    ctx.font = "400 12.5px Arial,sans-serif";
    ctx.fillText(label, PAD, y);
    ctx.fillStyle = "#000";
    ctx.font = boldValue ? "700 12.5px Arial,sans-serif" : "400 12.5px Arial,sans-serif";
    const vw = ctx.measureText(value).width;
    ctx.fillText(value, PAD + CONTENT_W - vw, y);
    y += ROW_H;
  };

  const { date, time } = fmtDateTime(data.timestamp);
  row("Tarix", date);
  row("Saat", time);
  row(data.isTakeaway ? "Sifariş" : "Masa", data.tableName);
  row("Çek №", "#" + String(data.receiptNo).padStart(5, "0"));
  row("Kassir", data.cashier);

  // Separator
  y += 8;
  drawSep(ctx, y);
  y += 1 + 8;

  // Items
  if (data.items.length === 0) {
    ctx.fillStyle = "#000";
    ctx.font = "400 12px Arial,sans-serif";
    const t = "Məhsul yoxdur";
    const tW = ctx.measureText(t).width;
    ctx.fillText(t, PAD + (CONTENT_W - tW) / 2, y);
    y += LH(12);
  } else {
    for (const li of data.items) {
      ctx.fillStyle = "#000";
      ctx.font = "700 12.5px Arial,sans-serif";
      ctx.fillText(li.name, PAD, y);
      y += LH(12.5);
      ctx.fillStyle = "#000";
      ctx.font = "400 12.5px Arial,sans-serif";
      const left = `${li.qty} × ${fmtMoney(li.price, data.currency)}`;
      ctx.fillText(left, PAD, y);
      ctx.font = "700 12.5px Arial,sans-serif";
      const right = fmtMoney(li.price * li.qty, data.currency);
      const rw = ctx.measureText(right).width;
      ctx.fillText(right, PAD + CONTENT_W - rw, y);
      y += LH(12.5) + 6;
    }
  }

  // Separator
  y += 8;
  drawSep(ctx, y);
  y += 1 + 8;

  // Məhsul sayı
  row("Məhsul sayı", `${data.items.reduce((s, li) => s + li.qty, 0)} ədəd`);

  // CƏMİ
  y += 4;
  ctx.fillStyle = "#000";
  ctx.font = "900 19px Arial,sans-serif";
  ctx.fillText("CƏMİ", PAD, y);
  const totalStr = fmtMoney(data.total, data.currency);
  const totalW = ctx.measureText(totalStr).width;
  ctx.fillText(totalStr, PAD + CONTENT_W - totalW, y);
  y += LH(19) + 4;

  // Paid / Not paid
  if (data.paid) {
    ctx.fillStyle = "#000";
    ctx.font = "400 12.5px Arial,sans-serif";
    ctx.fillText("Ödəniş növü", PAD, y);
    ctx.fillStyle = "#000";
    ctx.font = "700 12.5px Arial,sans-serif";
    const payVal = data.paymentMethod === "cash" ? "Nağd" : "Kart";
    const pvw = ctx.measureText(payVal).width;
    ctx.fillText(payVal, PAD + CONTENT_W - pvw, y);
    y += ROW_H;
    y += 12;
    const boxText = "ÖDƏNİLİB";
    ctx.font = "900 12px Arial,sans-serif";
    const bw = ctx.measureText(boxText).width;
    const bpadX = 12;
    const bpadY = 8;
    const bH = LH(12) + bpadY * 2;
    const bx = PAD + (CONTENT_W - bw - bpadX * 2) / 2;
    ctx.strokeStyle = "#16a34a";
    ctx.lineWidth = 2;
    roundRect(ctx, bx, y, bw + bpadX * 2, bH, 6);
    ctx.stroke();
    ctx.fillStyle = "#16a34a";
    ctx.fillText(boxText, bx + bpadX, y + bpadY);
    y += bH + 4;
  } else {
    y += 8;
    ctx.fillStyle = "#000";
    ctx.font = "italic 12px Arial,sans-serif";
    const t = "Ödəniş hələ qəbul olunmayıb";
    const tW = ctx.measureText(t).width;
    ctx.fillText(t, PAD + (CONTENT_W - tW) / 2, y);
    y += LH(12);
  }

  // Separator
  y += 8;
  drawSep(ctx, y);
  y += 1 + 8;

  // Footer
  y += 8;
  ctx.fillStyle = "#000";
  ctx.font = "400 12px Arial,sans-serif";
  const f1 = "Nuş olsun!";
  const f1W = ctx.measureText(f1).width;
  ctx.fillText(f1, PAD + (CONTENT_W - f1W) / 2, y);
  y += LH(12);
  const f2 = "Yenidən gözləyirik";
  const f2W = ctx.measureText(f2).width;
  ctx.fillText(f2, PAD + (CONTENT_W - f2W) / 2, y);
  y += LH(12);

  // Padding bottom already accounted in computeHeight

  return canvas.toDataURL("image/png");
}