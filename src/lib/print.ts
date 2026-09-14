import type { ReceiptData } from "../components/ui/Receipt";

let invokeFn: ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null = null;

async function getInvoke() {
  if (invokeFn) return invokeFn;
  try {
    const mod = await import("@tauri-apps/api/core");
    invokeFn = mod.invoke;
    return invokeFn;
  } catch {
    return null;
  }
}

export function isTauri(): boolean {
  return !!(window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
}

export async function printHtml(html: string): Promise<void> {
  const invoke = await getInvoke();
  if (invoke) {
    await invoke("print_receipt", { html });
    return;
  }
  const w = window.open("", "_blank", "width=380,height=600");
  if (!w) throw new Error("Yeni pəncərə açıla bilmədi");
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  await new Promise((r) => setTimeout(r, 400));
  w.print();
}

export async function printReceipt(data: ReceiptData): Promise<void> {
  const invoke = await getInvoke();
  if (invoke) {
    const { buildReceiptDataUrl } = await import("./receiptCanvas");
    const dataUrl = await buildReceiptDataUrl(data);
    const base64 = dataUrl.split(",")[1];
    await invoke("print_receipt_image", { base64 });
    return;
  }
  const { buildReceiptHtml } = await import("./receiptHtml");
  const html = buildReceiptHtml(data);
  const w = window.open("", "_blank", "width=380,height=600");
  if (!w) throw new Error("Yeni pəncərə açıla bilmədi");
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  await new Promise((r) => setTimeout(r, 400));
  w.print();
}