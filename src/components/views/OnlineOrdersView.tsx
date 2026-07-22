import { useApp } from "../../context/AppContext";
import { fmtMoney } from "../../lib/utils";
import type { OnlineOrderStatus } from "../../types";

const STATUS_CONFIG: Record<OnlineOrderStatus, { label: string; color: string; bg: string }> = {
  new:        { label: "Yeni",       color: "#FF6B6B", bg: "rgba(255,107,107,.1)" },
  preparing:  { label: "Hazırlanır", color: "#E0A23B", bg: "rgba(224,162,59,.1)" },
  ready:      { label: "Hazırdır",   color: "#12C7B4", bg: "rgba(18,199,180,.1)" },
  completed:  { label: "Tamamlandı", color: "#6C5CE7", bg: "rgba(108,92,231,.1)" },
  cancelled:  { label: "Ləğv edildi", color: "#999",   bg: "rgba(150,150,150,.1)" },
};

const STATUS_ORDER: OnlineOrderStatus[] = ["new", "preparing", "ready", "completed", "cancelled"];

export default function OnlineOrdersView() {
  const { data, clearOnlineBadge, updateOnlineOrderStatus, refreshOnlineOrders, toast } = useApp();

  const orders = data.onlineOrders;
  const hasNew = orders.some(o => o.status === "new");

  function handleStatusChange(id: string, newStatus: OnlineOrderStatus) {
    updateOnlineOrderStatus(id, newStatus);
    toast(`Sifariş statusu yeniləndi: ${STATUS_CONFIG[newStatus].label}`);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            🌐 Onlayn Sifarişlər
            {hasNew && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">Saytdan gələn sifarişlər burada görünəcək</p>
        </div>
        {hasNew ? (
          <button onClick={clearOnlineBadge}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>
            Yeni sifarişləri gördüm
          </button>
        ) : (
          <button onClick={() => refreshOnlineOrders()}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition">
            ↻ Yenilə
          </button>
        )}
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
            style={{ background: "linear-gradient(135deg,rgba(108,92,231,.12),rgba(18,199,180,.08))" }}>
            🌐
          </div>
          <h3 className="text-base font-extrabold text-gray-700 mb-1">Hələ heç bir onlayn sifariş yoxdur</h3>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            Sayt yaradıldıqdan sonra müştərilərin verdiyi sifarişlər burada real vaxt rejimində görünəcək.
          </p>
          <div className="flex items-center gap-2 mt-5">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">Gözləmə rejimi</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {STATUS_ORDER.filter(s => orders.some(o => o.status === s)).map(status => {
            const cfg = STATUS_CONFIG[status];
            const group = orders.filter(o => o.status === status);
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                  <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                  <span className="text-[11px] text-gray-400 font-bold">({group.length})</span>
                </div>
                <div className="space-y-2">
                  {group.map(order => (
                    <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-4 transition hover:shadow-md"
                      style={status === "new" ? { borderLeft: `3px solid ${cfg.color}` } : {}}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-extrabold text-sm text-gray-900">#{order.orderNo}</span>
                          <span className="text-sm text-gray-500 ml-2">{order.customerName}</span>
                          {order.customerPhone && (
                            <span className="text-xs text-gray-400 ml-2">{order.customerPhone}</span>
                          )}
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ color: cfg.color, background: cfg.bg }}>
                          {cfg.label}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 mb-2 space-y-0.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{item.qty}× {item.name}</span>
                            <span className="text-gray-400">{fmtMoney(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>

                      {order.note && (
                        <div className="text-xs text-gray-400 italic mb-2 px-2 py-1.5 bg-gray-50 rounded-lg">
                          📝 {order.note}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <span className="text-sm font-extrabold text-gray-900">{fmtMoney(order.total)}</span>
                        <div className="flex gap-1.5">
                          {status === "new" && (
                            <>
                              <button onClick={() => handleStatusChange(order.id, "preparing")}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition hover:-translate-y-0.5"
                                style={{ background: "#E0A23B" }}>
                                Qəbul et
                              </button>
                              <button onClick={() => handleStatusChange(order.id, "cancelled")}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-400 border border-gray-200 hover:bg-gray-50 transition">
                                Ləğv et
                              </button>
                            </>
                          )}
                          {status === "preparing" && (
                            <button onClick={() => handleStatusChange(order.id, "ready")}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition hover:-translate-y-0.5"
                              style={{ background: "#12C7B4" }}>
                              Hazırdır
                            </button>
                          )}
                          {status === "ready" && (
                            <button onClick={() => handleStatusChange(order.id, "completed")}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition hover:-translate-y-0.5"
                              style={{ background: "#6C5CE7" }}>
                              Təhvil verildi
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
