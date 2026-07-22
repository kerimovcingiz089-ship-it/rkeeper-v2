import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { fmtMoney, fmtTime, uid } from "../../lib/utils";
import Modal from "../ui/Modal";
import Receipt, { type ReceiptData } from "../ui/Receipt";

export default function TakeawayView() {
  const {
    data, setData, currentUser,
    takeawayCart, setTakeawayCart,
    takeawayActiveCat, setTakeawayActiveCat,
    takeawayCustomerName, setTakeawayCustomerName,
    toast, updateStockFor, saveOrderAndRefresh
  } = useApp();

  const [payModal, setPayModal] = useState(false);
  const [selectedPay, setSelectedPay] = useState<"cash" | "card">("cash");
  const [receiptModal, setReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);

  const catId = takeawayActiveCat || (data.categories[0]?.id ?? null);

  const total = takeawayCart.reduce((s, li) => {
    const item = data.items.find(i => i.id === li.itemId);
    return s + (item ? item.price * li.qty : 0);
  }, 0);

  function addToCart(itemId: string) {
    const item = data.items.find(i => i.id === itemId);
    if (item && item.stock <= 0) { toast("❌ Bu məhsul stokda yoxdur!"); return; }
    const line = takeawayCart.find(li => li.itemId === itemId);
    if (line) setTakeawayCart(takeawayCart.map(li => li.itemId === itemId ? { ...li, qty: li.qty + 1 } : li));
    else setTakeawayCart([...takeawayCart, { itemId, qty: 1 }]);
  }

  function changeQty(itemId: string, delta: number) {
    const updated = takeawayCart
      .map(li => li.itemId === itemId ? { ...li, qty: li.qty + delta } : li)
      .filter(li => li.qty > 0);
    setTakeawayCart(updated);
  }

  async function completeOrder() {
    setLoading(true);
    try {
      const lineItems = takeawayCart.map(li => {
        const item = data.items.find(i => i.id === li.itemId);
        return { name: item?.name ?? "?", qty: li.qty, price: item?.price ?? 0 };
      });
      const orderNo = data.nextTakeawayNo || 1;
      const customerName = takeawayCustomerName.trim() || "Müştəri";

      for (const li of takeawayCart) {
        const item = data.items.find(i => i.id === li.itemId);
        if (item) await updateStockFor(item.id, Math.max(0, item.stock - li.qty));
      }

      await saveOrderAndRefresh(total, lineItems, {
        tableName: `Paket #${orderNo}${customerName !== "Müştəri" ? ` (${customerName})` : ""}`,
        paymentMethod: selectedPay,
        closedBy: currentUser?.name ?? "Kassir",
        isTakeaway: true,
      });

      setData(prev => ({
        ...prev,
        takeawayOrders: [...prev.takeawayOrders, {
          id: uid("to"),
          orderNo,
          customerName,
          items: lineItems,
          total,
          paymentMethod: selectedPay,
          status: "waiting" as const,
          createdAt: Date.now(),
          closedBy: currentUser?.name ?? "Kassir"
        }],
        nextTakeawayNo: orderNo + 1
      }));

      setTakeawayCart([]);
      setTakeawayCustomerName("");
      toast("Paket sifariş #" + orderNo + " yaradıldı!");
      setPayModal(false);
    } finally {
      setLoading(false);
    }
  }

  function openTakeawayReceipt(orderId: string) {
    const order = data.takeawayOrders.find(o => o.id === orderId);
    if (!order) return;
    setReceiptData({
      restaurantName: data.settings.name,
      tableName: `Paket #${order.orderNo}${order.customerName !== "Müştəri" ? ` (${order.customerName})` : ""}`,
      items: order.items,
      total: order.total,
      receiptNo: order.orderNo,
      cashier: order.closedBy,
      paid: true,
      paymentMethod: order.paymentMethod,
      timestamp: order.createdAt,
      isTakeaway: true,
      currency: data.settings.currency,
    });
    setReceiptModal(true);
  }

  function printReceipt() {
    const el = document.getElementById("takeaway-receipt-area");
    if (!el) return;
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return;
    w.document.write(`<html><head><style>body{font-family:'Courier New',monospace;margin:0;padding:20px;}*{box-sizing:border-box;}</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close(); w.print();
    setReceiptModal(false);
  }

  const activeQueue = data.takeawayOrders.filter(o => o.status !== "completed").sort((a, b) => a.createdAt - b.createdAt);
  const canAct = takeawayCart.length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-full">

      {/* ── Left: Menu + Queue ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {data.categories.map(c => (
            <button key={c.id} onClick={() => setTakeawayActiveCat(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all
                ${catId === c.id ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-500 hover:border-[#6C5CE7] hover:text-[#6C5CE7]"}`}
              style={catId === c.id ? { background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" } : {}}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Item grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.items.filter(i => i.categoryId === catId).map(item => {
            const outOfStock = item.stock <= 0;
            return (
              <button key={item.id} onClick={() => addToCart(item.id)} disabled={outOfStock}
                className={`bg-white border rounded-2xl p-4 text-left transition-all
                  ${outOfStock ? "border-dashed border-gray-200 opacity-50 cursor-not-allowed" : "border-gray-200 hover:border-[#6C5CE7] hover:-translate-y-1 hover:shadow-md cursor-pointer"}`}>
                <div className="text-sm font-bold leading-snug mb-2 min-h-[36px] flex flex-col gap-1">
                  {item.name}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full w-fit
                    ${outOfStock ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                    {outOfStock ? "❌ Stok yoxdur" : `Stok: ${item.stock}`}
                  </span>
                </div>
                <div className="text-sm font-extrabold text-[#5847D1] tabular-nums">{fmtMoney(item.price, data.settings.currency)}</div>
              </button>
            );
          })}
        </div>

        {/* Queue */}
        {activeQueue.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-extrabold">📋 Paket Növbəsi</h3>
              <span className="text-xs font-bold text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded-full">
                Aktiv: <span className="text-orange-500 font-extrabold">{activeQueue.length}</span>
              </span>
            </div>
            {activeQueue.map(o => {
              const statusLabel = o.status === "waiting" ? "Gözləyir" : "Hazırdır";
              const statusCls = o.status === "waiting" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600";
              return (
                <div key={o.id} className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 flex items-center justify-between gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#FF6B35,#F7931E)" }}>
                      #{o.orderNo}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{o.customerName}</div>
                      <div className="text-xs text-gray-400">{o.items.map(li => li.name + " ×" + li.qty).join(", ")}</div>
                      <div className="text-xs text-gray-300">🕐 {fmtTime(o.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusCls}`}>{statusLabel}</span>
                    <span className="font-extrabold text-sm text-[#5847D1] tabular-nums">{fmtMoney(o.total, data.settings.currency)}</span>
                    <div className="flex gap-1">
                      {o.status === "waiting" && (
                        <button onClick={() => setData(prev => ({ ...prev, takeawayOrders: prev.takeawayOrders.map(x => x.id === o.id ? { ...x, status: "ready" } : x) }))}
                          className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-lg hover:opacity-90">Hazır</button>
                      )}
                      {o.status === "ready" && (
                        <button onClick={() => openTakeawayReceipt(o.id)}
                          className="px-2 py-1 border border-gray-200 text-xs font-bold rounded-lg hover:bg-gray-50">🖨️ Çek</button>
                      )}
                      <button onClick={() => setData(prev => ({ ...prev, takeawayOrders: prev.takeawayOrders.map(x => x.id === o.id ? { ...x, status: "completed" } : x) }))}
                        className="px-2 py-1 text-white text-xs font-bold rounded-lg hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>Təhvil</button>
                      <button onClick={() => { if (confirm("Ləğv edilsin?")) setData(prev => ({ ...prev, takeawayOrders: prev.takeawayOrders.filter(x => x.id !== o.id) })); toast("Ləğv edildi"); }}
                        className="px-2 py-1 bg-red-100 text-red-500 text-xs font-bold rounded-lg hover:bg-red-200">✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right: Cart ── */}
      <div className="lg:w-[370px] flex-shrink-0 bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-extrabold text-[15px]">📦 Paket Sifariş</h2>
          <p className="text-xs text-gray-400 mt-0.5">Müştəri alıb gedir</p>
        </div>
        <div className="px-4 pt-3">
          <input type="text" value={takeawayCustomerName} onChange={e => setTakeawayCustomerName(e.target.value)}
            placeholder="Müştəri adı (istəyə bağlı)"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6C5CE7] mb-2" />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {takeawayCart.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">Hələ heç nə əlavə olunmayıb.</div>
          ) : (
            takeawayCart.map(li => {
              const item = data.items.find(i => i.id === li.itemId);
              if (!item) return null;
              return (
                <div key={li.itemId} className="flex items-center gap-2 py-3 border-b border-[#F1EEFA] last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{item.name}</div>
                    <div className="text-xs text-gray-400">{fmtMoney(item.price, data.settings.currency)}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => changeQty(item.id, -1)} className="w-6 h-6 rounded-lg border border-gray-200 bg-white text-base leading-none hover:bg-[#F1EEFA]">−</button>
                    <span className="text-sm font-extrabold w-4 text-center">{li.qty}</span>
                    <button onClick={() => changeQty(item.id, 1)} className="w-6 h-6 rounded-lg border border-gray-200 bg-white text-base leading-none hover:bg-[#F1EEFA]">+</button>
                  </div>
                  <div className="text-sm font-extrabold tabular-nums min-w-[60px] text-right">{fmtMoney(item.price * li.qty, data.settings.currency)}</div>
                </div>
              );
            })
          )}
        </div>
        <div className="border-t border-gray-100 p-4 space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-400">Cəmi</span>
            <span className="text-2xl font-extrabold tabular-nums">{fmtMoney(total, data.settings.currency)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setTakeawayCart([]); setTakeawayCustomerName(""); }} disabled={!canAct}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:opacity-90 disabled:opacity-40">Təmizlə</button>
            <button onClick={() => setPayModal(true)} disabled={!canAct}
              className="flex-1 py-2.5 rounded-xl bg-[#1E9E77] text-white text-sm font-bold hover:opacity-90 disabled:opacity-40">Ödəniş & Yarat</button>
          </div>
        </div>
      </div>

      {/* ── Payment Modal ── */}
      {payModal && (
        <Modal onClose={() => setPayModal(false)}>
          <h3 className="text-lg font-extrabold mb-1">📦 Paket — Ödəniş</h3>
          <p className="text-sm text-gray-400 mb-4">Ödəniş növünü seçin.</p>
          <div className="flex gap-3 mb-4">
            {(["cash","card"] as const).map(p => (
              <button key={p} onClick={() => setSelectedPay(p)}
                className={`flex-1 py-4 rounded-xl border-2 text-sm font-bold transition-all
                  ${selectedPay === p ? "border-[#6C5CE7] bg-[#ECE9FE] text-[#5847D1]" : "border-gray-200 text-gray-400"}`}>
                {p === "cash" ? "💵 Nağd" : "💳 Kart"}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-baseline bg-gray-50 rounded-xl p-3 mb-5">
            <span className="text-sm text-gray-400">Ödəniləcək</span>
            <span className="text-2xl font-extrabold">{fmtMoney(total, data.settings.currency)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPayModal(false)} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 disabled:opacity-40">Ləğv et</button>
            <button onClick={completeOrder} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[#1E9E77] text-white text-sm font-bold hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Gözləyin...</>) : "Təsdiqlə"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Receipt Modal ── */}
      {receiptModal && receiptData && (
        <Modal onClose={() => setReceiptModal(false)} width="w-[340px]">
          <div id="takeaway-receipt-area" className="shadow-lg rounded overflow-hidden">
            <Receipt data={receiptData} />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setReceiptModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50">Bağla</button>
            <button onClick={printReceipt} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>🖨️ Çap et</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
