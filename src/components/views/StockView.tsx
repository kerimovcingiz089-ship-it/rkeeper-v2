import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function StockView() {
  const { data, currentUser, updateStockFor, toast } = useApp();
  const isAdmin = currentUser?.role === "admin";
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filteredItems = data.items.filter(item => {
    if (!q) return true;
    const cat = data.categories.find(c => c.id === item.categoryId);
    return item.name.toLowerCase().includes(q)
      || String(item.pluCode ?? "").includes(q)
      || (item.barcode || "").toLowerCase().includes(q)
      || (cat?.name || "").toLowerCase().includes(q);
  });

  async function handleAdjust(id: string, delta: number) {
    if (!isAdmin) { toast("Stoku yalnız Admin redaktə edə bilər"); return; }
    const item = data.items.find(i => i.id === id);
    if (item) await updateStockFor(id, Math.max(0, item.stock + delta));
  }

  async function handleInputChange(id: string, val: string) {
    if (!isAdmin) { toast("Stoku yalnız Admin redaktə edə bilər"); return; }
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0) await updateStockFor(id, n);
  }

  async function handleQuickAdd(id: string, addValId: string) {
    if (!isAdmin) { toast("Stoku yalnız Admin redaktə edə bilər"); return; }
    const item = data.items.find(i => i.id === id);
    const el = document.getElementById(addValId) as HTMLInputElement | null;
    const addVal = el ? parseInt(el.value, 10) : 0;
    if (item && !isNaN(addVal) && addVal > 0) {
      await updateStockFor(id, item.stock + addVal);
      toast(`${item.name} stokuna ${addVal} ədəd əlavə edildi`);
    }
  }

  return (
    <div>
      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h3 className="font-extrabold text-base">📦 Günlük Stok İdarəetməsi</h3>
          {!isAdmin && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-500">
              🔒 Yalnız Admin redaktə edə bilər
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          {isAdmin
            ? 'Məhsulların stoka girişini buradan edə bilərsiniz. Satış edildikcə mövcud say avtomatik azalacaq.'
            : 'Məhsulların mövcud stok miqdarını aşağıdakı cədvəldən izləyə bilərsiniz.'}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Məhsul axtarın (ad, PLU, barkod, kateqoriya)…"
          className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18] shadow-sm" />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </span>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {["Məhsul","Kateqoriya","Mövcud Stok","Sürətli Dəyişdir","Stoka Əlavə Et"].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-gray-400 font-bold px-4 py-3 border-b border-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">Heç nə tapılmadı.</td>
              </tr>
            )}
            {filteredItems.map(item => {
              const cat = data.categories.find(c => c.id === item.categoryId);
              const outOfStock = item.stock <= 0;
              const addValId = `add-val-${item.id}`;
              return (
                <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-sm">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#FEF7D7] text-[#8B6914]">{cat?.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full
                      ${outOfStock ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                      {item.stock} ədəd
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 w-fit">
                      <button onClick={() => handleAdjust(item.id, -1)} disabled={!isAdmin}
                        className="w-6 h-6 bg-white rounded-lg text-base leading-none shadow-sm hover:bg-gray-100 disabled:opacity-40 cursor-pointer">−</button>
                      <input type="number" value={item.stock} min={0}
                        disabled={!isAdmin}
                        onChange={e => handleInputChange(item.id, e.target.value)}
                        className="w-14 text-center border-none bg-transparent font-extrabold text-sm outline-none disabled:opacity-60"
                        style={{ MozAppearance: "textfield" } as any} />
                      <button onClick={() => handleAdjust(item.id, 1)} disabled={!isAdmin}
                        className="w-6 h-6 bg-white rounded-lg text-base leading-none shadow-sm hover:bg-gray-100 disabled:opacity-40 cursor-pointer">+</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input id={addValId} type="number" defaultValue={5} min={1}
                        disabled={!isAdmin}
                        className="w-16 text-center border border-gray-200 rounded-xl px-2 py-1.5 text-sm font-extrabold focus:outline-none focus:border-[#FABB18] disabled:opacity-60 cursor-pointer" />
                      <button onClick={() => handleQuickAdd(item.id, addValId)} disabled={!isAdmin}
                        className="px-3 py-1.5 text-white text-xs font-bold rounded-xl transition hover:opacity-90 disabled:opacity-40 cursor-pointer"
                        style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
                        + Əlavə et
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Heç nə tapılmadı.</div>
        ) : filteredItems.map(item => {
          const cat = data.categories.find(c => c.id === item.categoryId);
          const outOfStock = item.stock <= 0;
          const addValId = `add-val-m-${item.id}`;
          return (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-sm">{item.name}</div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FEF7D7] text-[#8B6914] mt-1 inline-block">{cat?.name}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${outOfStock ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                  {item.stock} ədəd
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                  <button onClick={() => handleAdjust(item.id, -1)} disabled={!isAdmin}
                    className="w-7 h-7 bg-white rounded-lg text-base leading-none shadow-sm hover:bg-gray-100 disabled:opacity-40 cursor-pointer">−</button>
                  <span className="text-sm font-extrabold w-8 text-center">{item.stock}</span>
                  <button onClick={() => handleAdjust(item.id, 1)} disabled={!isAdmin}
                    className="w-7 h-7 bg-white rounded-lg text-base leading-none shadow-sm hover:bg-gray-100 disabled:opacity-40 cursor-pointer">+</button>
                </div>
                <div className="flex items-center gap-1.5">
                  <input id={addValId} type="number" defaultValue={5} min={1} disabled={!isAdmin}
                    className="w-14 text-center border border-gray-200 rounded-xl px-2 py-1.5 text-sm font-bold focus:outline-none disabled:opacity-60" />
                  <button onClick={() => handleQuickAdd(item.id, addValId)} disabled={!isAdmin}
                    className="px-3 py-1.5 text-white text-xs font-bold rounded-xl disabled:opacity-40 cursor-pointer"
                    style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>+ Əlavə et</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
