
import { useApp } from "../../context/AppContext";
import { uid, fmtMoney } from "../../lib/utils";
import type { AppTable } from "../../types";

export default function TablesView() {
  const { data, setData, currentUser, switchView, setActiveTableId, setActiveCatId, toast } = useApp();
  const isAdmin = currentUser?.role === "admin";

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

  const freeCount = data.tables.filter(t => t.status === "free").length;
  const openCount = data.tables.filter(t => t.status === "open").length;
  const billCount = data.tables.filter(t => t.status === "bill").length;
  const totalRevenue = data.tables.reduce((sum, t) => sum + tableTotal(t.id), 0);

  const statusConfig = {
    free: {
      card: "bg-white border-gray-200 border-dashed shadow-none hover:border-gray-300",
      icon: "bg-gray-100 text-gray-400",
      badge: "",
      label: "Boş",
      sublabel: "Sifariş yoxdur",
    },
    open: {
      card: "bg-white border-[#6C5CE7]/30 shadow-md shadow-[#6C5CE7]/5 hover:shadow-lg hover:shadow-[#6C5CE7]/10 hover:-translate-y-1",
      icon: "bg-gradient-to-br from-[#6C5CE7] to-[#12C7B4] text-white",
      badge: "bg-[#ECE9FE] text-[#5847D1]",
      label: "Açıqdır",
      sublabel: "Sifariş aktiv",
    },
    bill: {
      card: "bg-white border-[#1E9E77]/30 shadow-md shadow-[#1E9E77]/5 hover:shadow-lg hover:shadow-[#1E9E77]/10 hover:-translate-y-1",
      icon: "bg-gradient-to-br from-[#1E9E77] to-[#12C7B4] text-white",
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
          <div className="w-9 h-9 rounded-xl bg-[#ECE9FE] flex items-center justify-center text-base">🟣</div>
          <div>
            <div className="text-[11px] text-[#5847D1] font-bold uppercase tracking-wider">Açıq</div>
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
          <div className="flex items-center gap-4 bg-gradient-to-r from-[#6C5CE7] to-[#12C7B4] rounded-2xl px-5 py-3 text-white ml-auto">
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
                    <div className="text-base font-extrabold text-[#5847D1] tabular-nums leading-tight">
                      {fmtMoney(total, data.settings.currency)}
                    </div>
                    {itemCount > 0 && (
                      <div className="text-[10px] text-gray-400 font-bold mt-0.5">{itemCount} məhsul</div>
                    )}
                  </div>
                ) : (
                  <div />
                )}

                {/* Delete button */}
                {isAdmin && t.status === "free" && (
                  <button
                    onClick={e => { e.stopPropagation(); deleteTable(t.id); }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-400 text-xs">
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add table */}
        {isAdmin && (
          <button onClick={addTable}
            className="border-2 border-dashed border-gray-200 rounded-2xl min-h-[110px] flex flex-col items-center justify-center gap-1 text-sm font-bold text-gray-400 hover:border-[#6C5CE7] hover:text-[#6C5CE7] hover:bg-[#F8F6FF] transition-all duration-200 group">
            <span className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-[#ECE9FE] flex items-center justify-center text-lg transition-all">+</span>
            Yeni masa
          </button>
        )}
      </div>
    </div>
  );
}
