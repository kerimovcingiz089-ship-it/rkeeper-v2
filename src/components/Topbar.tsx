import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

const TITLE_MAP: Record<string, string> = {
  tables: "Masalar", menu: "Menyu İdarəetməsi", reports: "Hesabatlar",
  users: "İstifadəçilər", settings: "Ayarlar", order: "Sifariş",
  takeaway: "Paket Sifariş", stock: "Stok İdarəetməsi",
};
const SUB_MAP: Record<string, string> = {
  tables: "Masaya klikləyərək sifariş açın",
  menu: "Kateqoriya və yeməkləri idarə edin",
  reports: "Günlük satış tarixçəsi (Supabase Live)",
  users: "İstifadəçiləri idarə edin, rol təyin edin",
  settings: "Restoran ayarları",
  order: "",
  takeaway: "Müştəri masaya oturmadan alıb gedir",
  stock: "Günlük məhsulların stokunun idarə edilməsi",
};

export default function Topbar() {
  const { currentView, data, activeTableId } = useApp();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const days = ["Bazar","Bazar ertəsi","Çərşənbə axşamı","Çərşənbə","Cümə axşamı","Cümə","Şənbə"];
    function tick() {
      const d = new Date();
      setClock(days[d.getDay()] + ", " +
        String(d.getHours()).padStart(2,"0") + ":" +
        String(d.getMinutes()).padStart(2,"0") + ":" +
        String(d.getSeconds()).padStart(2,"0"));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const title = TITLE_MAP[currentView] || "";
  const sub = currentView === "order" && activeTableId
    ? (data.tables.find(t => t.id === activeTableId)?.name || "")
    : SUB_MAP[currentView] || "";

  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-5 md:px-7">
      <div>
        <h1 className="text-[19px] font-extrabold tracking-tight leading-tight">{title}</h1>
        <p className="text-[12.5px] text-gray-400 mt-0.5">{sub}</p>
      </div>
      <div className="text-sm text-gray-400 tabular-nums hidden sm:block">{clock}</div>
    </header>
  );
}
