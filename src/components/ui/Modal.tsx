import React, { useEffect } from "react";

interface Props {
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}

export default function Modal({ onClose, children, width = "w-96" }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-6 ${width} max-w-full max-h-[90vh] overflow-y-auto animate-[fadeInUp_.2s_ease]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
