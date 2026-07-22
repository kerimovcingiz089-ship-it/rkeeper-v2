import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { fmtMoney } from "../../lib/utils";
import Modal from "../ui/Modal";
import Receipt, { type ReceiptData } from "../ui/Receipt";

export default function OrderView() {
  const {
    data, setData, currentUser, activeTableId, activeCatId, setActiveCatId,
    switchView, toast, updateStockFor, saveOrderAndRefresh
  } = useApp();

  const [payModal, setPayModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [selectedPay, setSelectedPay] = useState<"cash" | "card">("cash");
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);

  if (!activeTableId) return <p className="text-gray-400">Masa seçilməyib.</p>;

  const table = data.tables.find(t => t.id === activeTableId)!;
  if (!table) return <p className="text-gray-400">Masa tapılmadı.</p>;

  const catId = activeCatId || (data.categories[0]?.id ?? null);
  const order = data.orders[activeTableId] || { items: [] };

  const total = order.items.reduce((sum, li) => {
    const item = data.items.find(i => i.id === li.itemId);
    return sum + (item ? item.price * li.qty : 0);
  }, 0);

  function addItem(itemId: string) {
    const item = data.items.find(i => i.id === itemId);
    // 🟡 Stok=0 bloku
    if (item && item.stock <= 0) {
      toast("❌ Bu məhsul stokda yoxdur!");
      return;
    }
    setData(prev => {
      const ord = prev.orders[activeTableId!] || { items: [] };
      const line = ord.items.find(li => li.itemId === itemId);
      const newItems = line
        ? ord.items.map(li => li.itemId === itemId ? { ...li, qty: li.qty + 1 } : li)
        : [...ord.items, { itemId, qty: 1 }];
      return {
        ...prev,
        tables: prev.tables.map(t => t.id === activeTableId && t.status === "free" ? { ...t, status: "open" } : t),
        orders: { ...prev.orders, [activeTableId!]: { items: newItems } }
      };
    });
  }

  function changeQty(itemId: string, delta: number) {
    setData(prev => {
      const ord = prev.orders[activeTableId!] || { items: [] };
      const newItems = ord.items
        .map(li => li.itemId === itemId ? { ...li, qty: li.qty + delta } : li)
        .filter(li => li.qty > 0);
      return { ...prev, orders: { ...prev.orders, [activeTableId!]: { items: newItems } } };
    });
  }

  function cancelOrder() {
    if (!confirm("Bu sifarişi ləğv etmək istəyirsiniz?")) return;
    setData(prev => ({
      ...prev,
      orders: { ...prev.orders, [activeTableId!]: { items: [] } },
      tables: prev.tables.map(t => t.id === activeTableId ? { ...t, status: "free" } : t)
    }));
    switchView("tables");
  }

  async function closeBill() {
    setLoading(true);
    try {
      const lineItems = order.items.map(li => {
        const item = data.items.find(i => i.id === li.itemId);
        return { name: item?.name ?? "?", qty: li.qty, price: item?.price ?? 0 };
      });

      // deduct stock
      for (const li of order.items) {
        const item = data.items.find(i => i.id === li.itemId);
        if (item) await updateStockFor(item.id, Math.max(0, item.stock - li.qty));
      }

      await saveOrderAndRefresh(total, lineItems, {
        tableName: table.name,
        paymentMethod: selectedPay,
        closedBy: currentUser?.name ?? "Kassir",
        isTakeaway: false,
      });

      setData(prev => ({
        ...prev,
        orders: { ...prev.orders, [activeTableId!]: { items: [] } },
        tables: prev.tables.map(t => t.id === activeTableId ? { ...t, status: "free" } : t)
      }));

      toast("Hesab bağlandı: " + fmtMoney(total, data.settings.currency));
      setPayModal(false);
      switchView("tables");
    } finally {
      setLoading(false);
    }
  }

  function openReceiptPreview() {
    const lineItems = order.items.map(li => {
      const item = data.items.find(i => i.id === li.itemId);
      return { name: item?.name ?? "?", qty: li.qty, price: item?.price ?? 0 };
    });
    setReceiptData({
      restaurantName: data.settings.name,
      tableName: table.name,
      items: lineItems,
      total,
      receiptNo: data.nextReceiptNo,
      cashier: currentUser?.name ?? "",
      paid: false,
      paymentMethod: null,
      timestamp: Date.now(),
      currency: data.settings.currency,
    });
    setReceiptModal(true);
  }

  function printReceipt() {
    if (!receiptData) return;
    setData(prev => ({ ...prev, nextReceiptNo: (prev.nextReceiptNo || 1) + 1 }));
    const printWin = window.open("", "_blank", "width=400,height=600");
    if (!printWin) return;
    const el = document.getElementById("receipt-print-area");
    if (!el) return;
    printWin.document.write(`<html><head><style>
      body{font-family:'Courier New',monospace;margin:0;padding:20px;}
      *{box-sizing:border-box;}
    </style></head><body>${el.innerHTML}</body></html>`);
    printWin.document.close();
    printWin.print();
    setReceiptModal(false);
  }

  const canAct = order.items.length > 0;

  return (
    <div className="flex flex-col md:flex-row gap-5 h-full">

      {/* ── Menu Panel ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {data.categories.map(c => (
            <button key={c.id}
              onClick={() => setActiveCatId(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all
                ${catId === c.id
                  ? "text-white border-transparent"
                  : "bg-white border-gray-200 text-gray-500 hover:border-[#6C5CE7] hover:text-[#6C5CE7]"}`}
              style={catId === c.id ? { background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" } : {}}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto pb-2">
          {data.items.filter(i => i.categoryId === catId).map(item => {
            const outOfStock = item.stock <= 0;
            return (
              <button key={item.id}
                onClick={() => addItem(item.id)}
                disabled={outOfStock}
                className={`bg-white border rounded-2xl p-4 text-left transition-all group
                  ${outOfStock
                    ? "border-dashed border-gray-200 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-[#6C5CE7] hover:-translate-y-1 hover:shadow-md cursor-pointer"}`}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-20 object-cover rounded-xl mb-2" />
                ) : null}
                <div className="text-sm font-bold leading-snug mb-2 min-h-[36px] flex flex-col gap-1">
                  {item.name}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full w-fit
                    ${outOfStock ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                    {outOfStock ? "❌ Stok yoxdur" : `Stok: ${item.stock}`}
                  </span>
                </div>
                <div className="text-sm font-extrabold text-[#5847D1] tabular-nums">
                  {fmtMoney(item.price, data.settings.currency)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Cart Panel ── */}
      <div className="md:w-[340px] flex-shrink-0 bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-extrabold text-[15px]">{table.name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Cari sifariş</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {order.items.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              Hələ heç nə əlavə olunmayıb.<br />Soldan yemək seçin.
            </div>
          ) : (
            order.items.map(li => {
              const item = data.items.find(i => i.id === li.itemId);
              if (!item) return null;
              const lineTotal = item.price * li.qty;
              return (
                <div key={li.itemId} className="flex items-center gap-2 py-3 border-b border-[#F1EEFA] last:border-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{item.name}</div>
                    <div className="text-xs text-gray-400">{fmtMoney(item.price, data.settings.currency)}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => changeQty(item.id, -1)}
                      className="w-6 h-6 rounded-lg border border-gray-200 bg-white text-base leading-none hover:bg-[#F1EEFA]">−</button>
                    <span className="text-sm font-extrabold w-4 text-center">{li.qty}</span>
                    <button onClick={() => changeQty(item.id, 1)}
                      className="w-6 h-6 rounded-lg border border-gray-200 bg-white text-base leading-none hover:bg-[#F1EEFA]">+</button>
                  </div>
                  <div className="text-sm font-extrabold tabular-nums min-w-[60px] text-right">
                    {fmtMoney(lineTotal, data.settings.currency)}
                  </div>
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
            <button onClick={() => switchView("tables")}
              className="flex-1 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold hover:bg-gray-50 transition">
              ← Masalar
            </button>
            <button onClick={openReceiptPreview} disabled={!canAct}
              className="flex-1 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed">
              🖨 Çek
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={cancelOrder} disabled={!canAct}
              className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed">
              Ləğv et
            </button>
            <button onClick={() => setPayModal(true)} disabled={!canAct}
              className="flex-1 py-2 rounded-xl bg-[#1E9E77] text-white text-sm font-bold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed">
              Hesabı bağla
            </button>
          </div>
        </div>
      </div>

      {/* ── Payment Modal ── */}
      {payModal && (
        <Modal onClose={() => setPayModal(false)}>
          <h3 className="text-lg font-extrabold mb-1">Hesabı bağla</h3>
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
            <button onClick={() => setPayModal(false)} disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 disabled:opacity-40">Ləğv et</button>
            <button onClick={closeBill} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#1E9E77] text-white text-sm font-bold hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Gözləyin...</>) : "Təsdiqlə"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Receipt Modal ── */}
      {receiptModal && receiptData && (
        <Modal onClose={() => setReceiptModal(false)} width="w-[340px]">
          <div id="receipt-print-area" className="shadow-lg rounded overflow-hidden">
            <Receipt data={receiptData} />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setReceiptModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50">Bağla</button>
            <button onClick={printReceipt}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>🖨️ Çap et</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
