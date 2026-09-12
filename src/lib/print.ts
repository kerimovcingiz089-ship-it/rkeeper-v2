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