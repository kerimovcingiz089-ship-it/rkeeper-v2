import { useApp } from "../../context/AppContext";

export default function Toast() {
  const { toastMsg } = useApp();
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-full bg-[#211F2E] text-white text-sm font-bold shadow-xl transition-all duration-200 pointer-events-none
        ${toastMsg ? "opacity-100 -translate-y-2" : "opacity-0 translate-y-0"}`}
      style={{ transform: toastMsg ? "translateX(-50%) translateY(-8px)" : "translateX(-50%) translateY(0)" }}
    >
      {toastMsg}
    </div>
  );
}
