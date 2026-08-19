
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { uid, fmtMoney } from "../../lib/utils";
import Modal from "../ui/Modal";
import type { AppTable } from "../../types";

const QR_MENU_BASE = "https://arzumshirniyyat.vercel.app/m";

function qrMenuUrl(table: AppTable) {
  return QR_MENU_BASE + "/" + encodeURIComponent(table.name);
}

function qrImage(data: string, size = 400) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

export default function TablesView() {
  const { data, setData, currentUser, switchView, setActiveTableId, setActiveCatId, toast } = useApp();
  const isAdmin = currentUser?.role === "admin";
  const [qrTable, setQrTable] = useState<AppTable | null>(null);

  function tableTotal(tableId: string) {
    const order = data.orders[tableId];
    if (!order?.items.length) return 0;
    return order.items.reduce((sum, li) => {
      const item = data.items.find(i => i.id === li.itemId);
      return sum + (item ? item.price * li.qty : 0);
    }, 0);
  }

  function tableItemCount(tableId: string) {
    const order = data.orders[tableId];
    if (!order?.items.length) return 0;
    return order.items.reduce((sum, li) => sum + li.qty, 0);
  }

  function openTable(t: AppTable) {
    setActiveTableId(t.id);
    setActiveCatId(null);
    if (t.status === "free") {
      setData(prev => ({
        ...prev,
        tables: prev.tables.map(x => x.id === t.id ? { ...x, status: "open" } : x),
        orders: { ...prev.orders, [t.id]: { items: [] } }
      }));
    }
    switchView("order");
  }

  function deleteTable(id: string) {
    const t = data.tables.find(x => x.id === id);
    if (t?.status !== "free") { toast("Aktiv sifarişi olan masa silinə bilməz"); return; }
    if (!confirm("Bu masanı silmək istədiyinizə əminsiniz?")) return;
    setData(prev => ({ ...prev, tables: prev.tables.filter(x => x.id !== id) }));
  }

  function addTable() {
    const n = data.tables.length + 1;
    setData(prev => ({ ...prev, tables: [...prev.tables, { id: uid("t"), name: "Masa " + n, status: "free" }] }));
  }

  function printQr(table: AppTable) {
    const url = qrMenuUrl(table);
    const qr = qrImage(url, 600);
    const w = window.open("", "_blank", "width=420,height=640");
    if (!w) return;
    w.document.write(`<html><head><title>QR · ${table.name}</title><style>
      body{font-family:'Segoe UI',Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;background:#fff}
      .card{text-align:center;padding:24px}
      h2{color:#3F2218;margin:0 0 12px;font-size:22px}
      img{width:360px;height:360px}
      .hint{color:#3F2218;font-size:13px;font-weight:600;margin-top:10px}
      .url{color:#999;font-size:11px;margin-top:6px;word-break:break-all;max-width:340px}
    </style></head><body>
      <div class="card">
        <h2>${table.name}</h2>
        <img src="${qr}" alt="QR" />
        <div class="hint">Menyuya baxmaq üçün kodu skan edin</div>
        <div class="url">${url}</div>
      </div>
      <script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
    </body></html>`);
    w.document.close();
  }

  const freeCount = data.tables.filter(t => t.status === "free").length;
  const openCount = data.tables.filter(t => t.status === "open").length;
  const billCount = data.tables.filter(t => t.status === "bill").length;
  const totalRevenue = data.tables.reduce((sum, t) => sum + tableTotal(t.id), 0);

  const statusConfig = {
    free: {
      card: "bg-white border-gray-200 border-dashed shadow-none hover:border-[#FABB18]",
      icon: "bg-gray-100 text-gray-400",
      badge: "",
      label: "Boş",
      sublabel: "Sifariş yoxdur",
    },
    open: {
      card: "bg-white border-[#FABB18]/30 shadow-md shadow-[#FABB18]/5 hover:border-[#FABB18] hover:shadow-lg hover:shadow-[#FABB18]/10 hover:-translate-y-1",
      icon: "bg-gradient-to-br from-[#FABB18] to-[#D4A017] text-white",
      badge: "bg-[#FEF3C7] text-[#3F2218]",
      label: "Açıqdır",
      sublabel: "Sifariş aktiv",
    },
    bill: {
      card: "bg-white border-[#1E9E77]/30 shadow-md shadow-[#1E9E77]/5 hover:border-[#FABB18] hover:shadow-lg hover:shadow-[#1E9E77]/10 hover:-translate-y-1",
      icon: "bg-gradient-to-br from-[#1E9E77] to-[#D4A017] text-white",
      badge: "bg-[#DDF4EC] text-[#1E9E77]",
      label: "Hesab",
      sublabel: "Ödəniş gözləyir",
    },
  };

  return (
    <div>
      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-6 flex-wrap">
        <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-3">
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-base">🍽</div>
          <div>
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Boş</div>
            <div className="text-lg font-extrabold">{freeCount}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-3">
          <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-base">🟣</div>
          <div>
            <div className="text-[11px] text-[#3F2218] font-bold uppercase tracking-wider">Açıq</div>
            <div className="text-lg font-extrabold">{openCount}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-3">
          <div className="w-9 h-9 rounded-xl bg-[#DDF4EC] flex items-center justify-center text-base">💰</div>
          <div>
            <div className="text-[11px] text-[#1E9E77] font-bold uppercase tracking-wider">Hesab</div>
            <div className="text-lg font-extrabold">{billCount}</div>
          </div>
        </div>
        {totalRevenue > 0 && (
          <div className="flex items-center gap-4 bg-gradient-to-r from-[#FABB18] to-[#D4A017] rounded-2xl px-5 py-3 text-white ml-auto">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-base">₼</div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">Cari cəmi</div>
              <div className="text-lg font-extrabold">{fmtMoney(totalRevenue, data.settings.currency)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {data.tables.map(t => {
          const cfg = statusConfig[t.status];
          const total = tableTotal(t.id);
          const itemCount = tableItemCount(t.id);
          return (
            <div key={t.id}
              onClick={() => openTable(t)}
              className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 min-h-[110px] flex flex-col justify-between group ${cfg.card}`}>

              {/* Status badge */}
              {t.status !== "free" && (
                <span className={`absolute top-2.5 right-2.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${cfg.badge}`}>
                  {t.status === "open" ? "Sifariş" : "Hesab"}
                </span>
              )}

              {/* Top: icon + name */}
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0 ${cfg.icon} transition-all duration-200`}>
                  {t.status === "free" ? t.name.replace("Masa ", "") : (t.status === "open" ? "🍽" : "💰")}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-extrabold truncate">{t.name}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{cfg.sublabel}</div>
                </div>
              </div>

              {/* Bottom: price + item count */}
              <div className="mt-3 flex items-end justify-between">
                {total > 0 ? (
                  <div>
                    <div className="text-base font-extrabold text-[#3F2218] tabular-nums leading-tight">
                      {fmtMoney(total, data.settings.currency)}
                    </div>
                    {itemCount > 0 && (
                      <div className="text-[10px] text-gray-400 font-bold mt-0.5">{itemCount} məhsul</div>
                    )}
                  </div>
                ) : (
                  <div />
                )}

                {/* QR + Delete buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); setQrTable(t); }}
                    title="QR kodu"
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-amber-50 hover:text-[#FABB18]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14h1v1M14 20h1v-1M18 18h3v3h-3z" />
                    </svg>
                  </button>
                  {isAdmin && t.status === "free" && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteTable(t.id); }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-400 text-xs">
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add table */}
        {isAdmin && (
          <button onClick={addTable}
            className="border-2 border-dashed border-gray-200 rounded-2xl min-h-[110px] flex flex-col items-center justify-center gap-1 text-sm font-bold text-gray-400 hover:border-[#FABB18] hover:text-[#FABB18] hover:bg-[#FFFBEB] transition-all duration-200 group">
            <span className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-[#FEF3C7] flex items-center justify-center text-lg transition-all">+</span>
            Yeni masa
          </button>
        )}
      </div>

      {/* QR modal */}
      {qrTable && (
        <Modal onClose={() => setQrTable(null)}>
          <div className="text-center">
            <h3 className="text-base font-extrabold text-gray-900 mb-1">{qrTable.name} · QR kodu</h3>
            <p className="text-xs text-gray-400 mb-5">Müştərilər kodu skan edib menyuya baxa bilər</p>

            <div className="mx-auto w-48 h-48 rounded-2xl border border-gray-100 bg-white p-3 flex items-center justify-center">
              <img src={qrImage(qrMenuUrl(qrTable))} alt={`${qrTable.name} QR kodu`} className="w-full h-full object-contain" />
            </div>

            <div className="text-[11px] text-gray-400 mt-3 break-all bg-gray-50 rounded-lg px-3 py-2">
              {qrMenuUrl(qrTable)}
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => printQr(qrTable)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition hover:-translate-y-0.5 cursor-pointer"
                style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
                Çap et
              </button>
              <button onClick={() => setQrTable(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition cursor-pointer">
                Bağla
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
