import { useState } from "react";
import type { Category, Product } from "../lib/api";
import type { CartItem } from "../App";
import { placeOrder } from "../lib/api";

interface Props {
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  addToCart: (p: Product) => void;
  updateQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

export default function MenuPage({ categories, products, cart, addToCart, updateQty, removeFromCart, clearCart }: Props) {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderModal, setOrderModal] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const filtered = activeCat ? products.filter(p => p.categoryId === activeCat) : products;
  const cartTotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0);

  async function handleOrder() {
    if (!name.trim() || !phone.trim()) return;
    setSending(true);
    const ok = await placeOrder({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      items: cart.map(c => ({ name: c.product.name, qty: c.qty, price: c.product.price })),
      total: cartTotal,
      note: note.trim(),
    });
    setSending(false);
    if (ok) {
      setOrderSent(true);
      clearCart();
      setName(""); setPhone(""); setNote("");
      setTimeout(() => { setOrderSent(false); setOrderModal(false); }, 3000);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Menyumuz</h1>
        <p className="text-gray-400 text-sm">Bütün məhsullarımızı kəşf edin</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button onClick={() => setActiveCat(null)}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all
            ${!activeCat ? "text-white" : "text-gray-500 bg-white border border-gray-200 hover:bg-gray-50"}`}
          style={!activeCat ? { background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" } : {}}>
          Hamısı
        </button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setActiveCat(c.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all
              ${activeCat === c.id ? "text-white" : "text-gray-500 bg-white border border-gray-200 hover:bg-gray-50"}`}
            style={activeCat === c.id ? { background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" } : {}}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => {
          const inCart = cart.find(c => c.product.id === p.id);
          const catName = categories.find(c => c.id === p.categoryId)?.name;
          return (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: "linear-gradient(135deg,rgba(108,92,231,.08),rgba(18,199,180,.06))" }}>
                  🍰
                </div>
                {catName && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">{catName}</span>
                )}
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">{p.name}</h3>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-extrabold" style={{ color: "#6C5CE7" }}>₼{p.price.toFixed(2)}</span>
                {inCart ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(p.id, inCart.qty - 1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-200 transition">−</button>
                    <span className="text-sm font-extrabold w-5 text-center">{inCart.qty}</span>
                    <button onClick={() => addToCart(p)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold transition hover:scale-105"
                      style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>+</button>
                  </div>
                ) : (
                  <button onClick={() => addToCart(p)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg transition hover:scale-110"
                    style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>
                    +
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Cart Drawer ── */}
      {cart.length > 0 && (
        <>
          {/* Floating cart button */}
          <button onClick={() => setCartOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-6 py-3.5 rounded-2xl text-white font-bold text-sm shadow-2xl transition hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)", boxShadow: "0 10px 40px rgba(108,92,231,.45)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Səbət ({cart.length})
            <span className="font-extrabold">₼{cartTotal.toFixed(2)}</span>
          </button>

          {/* Overlay */}
          {cartOpen && <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setCartOpen(false)} />}

          {/* Drawer */}
          <div className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-extrabold text-lg">Səbət</h3>
              <button onClick={() => setCartOpen(false)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.map(c => (
                <div key={c.product.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: "linear-gradient(135deg,rgba(108,92,231,.1),rgba(18,199,180,.06))" }}>🍰</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900 truncate">{c.product.name}</div>
                    <div className="text-xs text-gray-400">₼{c.product.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(c.product.id, c.qty - 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold hover:bg-gray-50">−</button>
                    <span className="text-sm font-extrabold w-5 text-center">{c.qty}</span>
                    <button onClick={() => addToCart(c.product)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: "#6C5CE7" }}>+</button>
                  </div>
                  <div className="font-bold text-sm w-16 text-right">₼{(c.product.price * c.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-semibold">Cəmi</span>
                <span className="text-xl font-extrabold" style={{ color: "#6C5CE7" }}>₼{cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={() => { setCartOpen(false); setOrderModal(true); }}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)", boxShadow: "0 4px 14px rgba(108,92,231,.35)" }}>
                Sifariş ver
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Order Modal ── */}
      {orderModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setOrderSent ? null : setOrderModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              {orderSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                    style={{ background: "linear-gradient(135deg,rgba(18,199,180,.15),rgba(108,92,231,.1))" }}>✓</div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1">Sifariş qəbul edildi!</h3>
                  <p className="text-sm text-gray-400">Tezliklə sizinlə əlaqə saxlayacağıq</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-extrabold text-lg">Sifariş</h3>
                    <button onClick={() => setOrderModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">✕</button>
                  </div>
                  <div className="space-y-3 mb-5">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Adınız"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6C5CE7] transition" />
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefon nömrəniz"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6C5CE7] transition" />
                    <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Qeyd (ixtiyari)"
                      rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6C5CE7] transition resize-none" />
                  </div>
                  <div className="text-sm text-gray-500 mb-4">Cəmi: <span className="font-extrabold text-lg" style={{ color: "#6C5CE7" }}>₼{cartTotal.toFixed(2)}</span></div>
                  <button onClick={handleOrder} disabled={!name.trim() || !phone.trim() || sending}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>
                    {sending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Göndərilir...</> : "Sifarişi göndər"}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
