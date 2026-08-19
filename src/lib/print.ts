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

export async function printHtml(html: string): Promise<void> {
  const invoke = await getInvoke();
  if (invoke) {
    await invoke("print_receipt", { html });
  } else {
    const w = window.open("", "_blank", "width=380,height=600");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 300);
    }
  }
}
