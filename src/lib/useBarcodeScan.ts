import { useEffect, useRef } from "react";

const SCAN_TIMEOUT = 400;
const SCAN_MAX = 40;

export function useBarcodeScan(onScan: (code: string) => void) {
  const cbRef = useRef(onScan);
  cbRef.current = onScan;

  useEffect(() => {
    let buffer = "";
    let timer: number | undefined;

    const flush = () => {
      if (timer) window.clearTimeout(timer);
      timer = undefined;
      const code = buffer;
      buffer = "";
      if (code) cbRef.current(code);
    };

    const reset = () => {
      if (timer) window.clearTimeout(timer);
      timer = undefined;
      buffer = "";
    };

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField = !!target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if (inField) { reset(); return; }

      if (e.key === "Enter" || e.key === "Tab") {
        if (buffer) { e.preventDefault(); flush(); }
        return;
      }
      if (/^\d$/.test(e.key)) {
        buffer += e.key;
        if (buffer.length > SCAN_MAX) { reset(); return; }
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(flush, SCAN_TIMEOUT);
        return;
      }
      if (buffer) reset();
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (timer) window.clearTimeout(timer);
    };
  }, []);
}