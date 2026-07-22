import { useState } from "react";
import type { Category, Product } from "../lib/api";
import type { CartItem } from "../App";
import { placeOrder } from "../lib/api";

const CAT_EMOJI: Record<string, string> = {
  default: "🍰",
};

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
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

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
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#FFFBF5,#FFF5F5)" }}>
      <div className="max-w-7xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400 mb-2 block">Menyumuz</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dadlı seçimlərimiz</h1>
          <p className="text-gray-400 text-sm">Bütün məhsullarımızı kəşf edin</p>
        </div>

        {/* Category pills */}
        <div className="flex gap-2.5 overflow-x-auto pb-5 mb-8 scrollbar-hide">
          <button onClick={() => setActiveCat(null)}
            className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
              !activeCat ? "text-white shadow-lg" : "text-gray-500 bg-white border border-gray-100 hover:border-rose-200 hover:text-rose-500"
            }`}
            style={!activeCat ? { background: "linear-gradient(135deg,#F43F5E,#E11D48)", boxShadow: "0 4px 16px rgba(244,63,94,.3)" } : {}}>
            ✨ Hamısı
          </button>
          {categories.map((c, i) => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                activeCat === c.id ? "text-white shadow-lg" : "text-gray-500 bg-white border border-gray-100 hover:border-rose-200 hover:text-rose-500"
              }`}
              style={activeCat === c.id ? { background: "linear-gradient(135deg,#F43F5E,#E11D48)", boxShadow: "0 4px 16px rgba(244,63,94,.3)" } : {}}>
              {["🍰", "🧁", "🍮", "☕", "🥤"][i % 5]} {c.name}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => {
            const inCart = cart.find(c => c.product.id === p.id);
            const catName = categories.find(c => c.id === p.categoryId)?.name;
            return (
              <div key={p.id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Image area */}
                <div className="relative h-44 flex items-center justify-center overflow-hidden"
                  style={{ background: `linear-gradient(135deg,hsl(${(i * 37 + 340) % 360},85%,97%),hsl(${(i * 37 + 20) % 360},75%,95%))` }}>
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🍰</span>
                  {catName && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-500">
                      {catName}
                    </span>
                  )}
                </div>
                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xl font-bold text-rose-500">₼{p.price.toFixed(2)}</span>
                    {inCart ? (
                      <div className="flex items-center gap-2 bg-rose-50 rounded-2xl px-1 py-1">
                        <button onClick={() => updateQty(p.id, inCart.qty - 1)}
                          className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-sm font-bold text-gray-600 hover:text-rose-500 transition shadow-sm">−</button>
                        <span className="text-sm font-extrabold w-5 text-center text-rose-600">{inCart.qty}</span>
                        <button onClick={() => addToCart(p)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold transition shadow-sm"
                          style={{ background: "#F43F5E" }}>+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p)}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-all hover:scale-110 hover:shadow-lg"
                        style={{ background: "linear-gradient(135deg,#F43F5E,#E11D48)", boxShadow: "0 4px 12px rgba(244,63,94,.25)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Floating Cart Button ── */}
      {cart.length > 0 && (
        <>
          <button onClick={() => setCartOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-7 py-4 rounded-2xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: "linear-gradient(135deg,#F43F5E,#E11D48)", boxShadow: "0 10px 40px rgba(244,63,94,.4)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span>Səbət ({cartCount})</span>
            <span className="font-extrabold">₼{cartTotal.toFixed(2)}</span>
          </button>

          {/* Overlay */}
          {cartOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setCartOpen(false)} />}

          {/* Drawer */}
          <div className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-display font-bold text-xl">Səbətiniz</h3>
                <p className="text-xs text-gray-400 mt-0.5">{cartCount} məhsul</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {cart.map(c => (
                <div key={c.product.id} className="flex items-center gap-4 bg-rose-50/50 rounded-2xl p-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: `linear-gradient(135deg,hsl(${(parseInt(c.product.id) * 37 + 340) % 360},80%,95%),hsl(${(parseInt(c.product.id) * 37 + 20) % 360},70%,93%))` }}>🍰</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900 truncate">{c.product.name}</div>
                    <div className="text-xs text-rose-400 font-semibold">₼{c.product.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(c.product.id, c.qty - 1)}
                      className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xs font-bold hover:border-rose-300 transition">−</button>
                    <span className="text-sm font-extrabold w-6 text-center">{c.qty}</span>
                    <button onClick={() => addToCart(c.product)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: "#F43F5E" }}>+</button>
                  </div>
                  <div className="font-bold text-sm w-16 text-right">₼{(c.product.price * c.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-semibold">Cəmi</span>
                <span className="font-display text-2xl font-bold text-rose-500">₼{cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={() => { setCartOpen(false); setOrderModal(true); }}
                className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,#F43F5E,#E11D48)", boxShadow: "0 6px 24px rgba(244,63,94,.3)" }}>
                Sifariş ver
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Order Modal ── */}
      {orderModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => !orderSent && setOrderModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
              {orderSent ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl"
                    style={{ background: "linear-gradient(135deg,rgba(18,199,180,.12),rgba(244,63,94,.08))" }}>🎉</div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Sifariş qəbul edildi!</h3>
                  <p className="text-sm text-gray-400">Tezliklə sizinlə əlaqə saxlayacağıq</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display font-bold text-xl">Sifariş</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{cartCount} məhsul · ₼{cartTotal.toFixed(2)}</p>
                    </div>
                    <button onClick={() => setOrderModal(false)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition">✕</button>
                  </div>
                  <div className="space-y-3 mb-6">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Adınız"
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition" />
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefon nömrəniz" type="tel"
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition" />
                    <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Qeyd (ixtiyari)"
                      rows={2} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition resize-none" />
                  </div>
                  <button onClick={handleOrder} disabled={!name.trim() || !phone.trim() || sending}
                    className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#F43F5E,#E11D48)", boxShadow: "0 6px 24px rgba(244,63,94,.3)" }}>
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
