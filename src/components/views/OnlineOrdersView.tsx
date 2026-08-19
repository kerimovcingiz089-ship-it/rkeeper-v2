import { useApp } from "../../context/AppContext";
import { fmtMoney, fmtDateTime } from "../../lib/utils";
import { printHtml } from "../../lib/print";
import { getCatEmoji } from "../../lib/categoryIcons";
import type { OnlineOrderStatus } from "../../types";

const STATUS_CONFIG: Record<OnlineOrderStatus, { label: string; color: string; bg: string }> = {
  new:        { label: "Yeni",       color: "#FF6B6B", bg: "rgba(255,107,107,.1)" },
  preparing:  { label: "Hazırlanır", color: "#E0A23B", bg: "rgba(224,162,59,.1)" },
  ready:      { label: "Hazırdır",   color: "#D4A017", bg: "rgba(212,160,23,.1)" },
  completed:  { label: "Tamamlandı", color: "#3F2218", bg: "rgba(63,34,24,.1)" },
  cancelled:  { label: "Ləğv edildi", color: "#999",   bg: "rgba(150,150,150,.1)" },
};

function printOnlineReceipt(order: any, data: any) {
  const { date, time } = fmtDateTime(order.createdAt);
  const W = "=".repeat(32);
  const D = "-".repeat(32);
  const items = order.items.map((li: any) => {
    const name = li.name.length > 20 ? li.name.slice(0, 20) + ".." : li.name;
    const line = li.qty + " x " + fmtMoney(li.price, "");
    const total = fmtMoney(li.price * li.qty, "");
    const pad = 32 - line.length - total.length;
    return name + "\n" + line + " ".repeat(Math.max(1, pad)) + total;
  }).join("\n");
  const qtyTotal = order.items.reduce((s: number, li: any) => s + li.qty, 0);
  const label = "Məhsul sayı";
  const qtyLine = qtyTotal + " ədəd";
  const p1 = 32 - label.length - qtyLine.length;
  const totalPad = 32 - "CƏMİ".length - fmtMoney(order.total, "").length;
  const html = `<pre style="font-family:'Courier New',monospace;font-size:12px;width:270px;margin:0 auto;padding:16px 12px;line-height:1.5;white-space:pre-wrap">
<b>${data.settings.name}</b>

${W}
Tarix:             ${date}
Saat:              ${time}
Müştəri:           ${order.customerName}
Sifariş:           #${order.orderNo}
${D}
${items}
${D}
${label}${" ".repeat(Math.max(1, p1))}${qtyLine}
<b>CƏMİ</b>${" ".repeat(Math.max(1, totalPad))}<b>${fmtMoney(order.total, data.settings.currency)}</b>
${W}

Nuş olsun! Yenidən gözləyirik</pre>`;
  printHtml(html);
}

function whatsAppMessage(status: string, orderNo: number): string {
  const msgs: Record<string, string> = {
    new: "Sifarişiniz qeydə alınd\u0131.",
    ready: "Sifarişiniz haz\u0131rd\u0131r v\u0259 \u0259n q\u0131sa zamanda \u00E7atd\u0131r\u0131lacaq.",
    completed: "Sifari\u015Finiz t\u0259hvil verildi. Bizi se\u00E7diyiniz \u00FC\u00E7\u00FCn t\u0259\u015F\u0259kk\u00FCr edirik.",
  };
  return msgs[status] || "Sifari\u015F #" + orderNo;
}

const STATUS_ORDER: OnlineOrderStatus[] = ["new", "preparing", "ready", "completed", "cancelled"];

export default function OnlineOrdersView() {
  const { data, clearOnlineBadge, updateOnlineOrderStatus, refreshOnlineOrders, toast } = useApp();

  const orders = data.onlineOrders;
  const hasNew = orders.some(o => o.status === "new");

  function checkStock(order: { items: { name: string; qty: number }[] }): { ok: boolean; missing: string[] } {
    const missing: string[] = [];
    for (const line of order.items) {
      const product = data.items.find(p => p.name === line.name);
      if (!product || product.stock < line.qty) {
        const avail = product ? product.stock : 0;
        missing.push(`${line.name} (stok: ${avail}, lazım: ${line.qty})`);
      }
    }
    return { ok: missing.length === 0, missing };
  }

  function handleAccept(order: { id: string; items: { name: string; qty: number }[] }) {
    const { ok, missing } = checkStock(order);
    if (!ok) {
      toast("Stok kifayət etmir: " + missing.join(", "));
      return;
    }
    updateOnlineOrderStatus(order.id, "preparing");
    toast("Sifariş qəbul edildi");
  }

  function handleStatusChange(id: string, newStatus: OnlineOrderStatus) {
    if (newStatus === "completed") {
      const order = orders.find(o => o.id === id);
      if (order) {
        const { ok, missing } = checkStock(order);
        if (!ok) {
          toast("Stok kifayət etmir: " + missing.join(", "));
          return;
        }
      }
    }
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
            className="px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:-translate-y-0.5 cursor-pointer"
            style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
            Yeni sifarişləri gördüm
          </button>
        ) : (
          <button onClick={() => refreshOnlineOrders()}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition cursor-pointer">
            ↻ Yenilə
          </button>
        )}
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
            style={{ background: "linear-gradient(135deg,rgba(250,187,24,.12),rgba(212,160,23,.08))" }}>
            🌐
          </div>
          <h3 className="text-base font-extrabold text-gray-700 mb-1">Hələ heç bir onlayn sifariş yoxdur</h3>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            Sayt yaradıldıqdan sonra müştərilərin verdiyi sifarişlər burada real vaxt rejimində görünəcək.
          </p>
          <div className="flex items-center gap-2 mt-5">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">Gözləmə rejimi · Hər 30 saniyədə yoxlanılır</span>
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
                  {group.map(order => {
                    const stockCheck = status === "new" ? checkStock(order) : null;
                    return (
                      <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-4 transition hover:shadow-md"
                        style={status === "new" ? { borderLeft: `3px solid ${cfg.color}` } : {}}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="font-extrabold text-sm text-gray-900">#{order.orderNo}</span>
                            {order.table && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-lg ml-2 text-[#3F2218] bg-[#FEF3C7]">{order.table}</span>
                            )}
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
                          {order.items.map((item, i) => {
                            const product = data.items.find(p => p.name === item.name);
                            const hasEnough = product && product.stock >= item.qty;
                            return (
                              <div key={i} className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5">
                                  {product?.imageUrl ? (
                                    <img src={product.imageUrl} alt={item.name} className="w-5 h-5 rounded object-cover shrink-0" />
                                  ) : product ? (
                                    <span className="text-sm">{getCatEmoji(data.categories.find(c => c.id === product.categoryId)?.name ?? "")}</span>
                                  ) : null}
                                  {item.qty}× {item.name}
                                  {status === "new" && !hasEnough && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500">
                                      Stok: {product ? product.stock : 0}
                                    </span>
                                  )}
                                </span>
                                <span className="text-gray-400">{fmtMoney(item.price * item.qty, data.settings.currency)}</span>
                              </div>
                            );
                          })}
                        </div>

                        {order.note && (
                          <div className="text-xs text-gray-400 italic mb-2 px-2 py-1.5 bg-gray-50 rounded-lg">
                            📝 {order.note}
                          </div>
                        )}

                        {/* Stock warning */}
                        {stockCheck && !stockCheck.ok && (
                          <div className="text-[11px] font-semibold text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-2">
                            ⚠️ Stok kifayət etmir: {stockCheck.missing.join("; ")}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <span className="text-sm font-extrabold text-gray-900">{fmtMoney(order.total, data.settings.currency)}</span>
                          <div className="flex gap-1.5 items-center">
                            {/* WhatsApp */}
                            {order.customerPhone?.replace(/\D/g, "").length >= 9 && (
                              <a href={`https://wa.me/994${order.customerPhone.replace(/\D/g, "").slice(-9)}?text=${encodeURIComponent(whatsAppMessage(status, order.orderNo))}`}
                                target="_blank" rel="noopener noreferrer"
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white hover:scale-110 transition"
                                style={{ background: "#25D366" }}
                                title="WhatsApp-dan bildiriş göndər">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              </a>
                            )}
                            {status === "new" && (
                              <>
                                <button onClick={() => handleAccept(order)}
                                  disabled={stockCheck ? !stockCheck.ok : false}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                                  style={{ background: "#E0A23B" }}>
                                  Qəbul et
                                </button>
                                <button onClick={() => handleStatusChange(order.id, "cancelled")}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-400 border border-gray-200 hover:bg-gray-50 transition cursor-pointer">
                                  Ləğv et
                                </button>
                              </>
                            )}
                            {status === "preparing" && (
                              <button onClick={() => handleStatusChange(order.id, "ready")}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition hover:-translate-y-0.5 cursor-pointer"
                                style={{ background: "#D4A017" }}>
                                Hazırdır
                              </button>
                            )}
                            {status === "ready" && (
                              <>
                                <button onClick={() => handleStatusChange(order.id, "completed")}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition hover:-translate-y-0.5 cursor-pointer"
                                  style={{ background: "#FABB18" }}>
                                  Təhvil verildi
                                </button>
                                <button onClick={() => printOnlineReceipt(order, data)}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition cursor-pointer">
                                  🖨 Çek
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
