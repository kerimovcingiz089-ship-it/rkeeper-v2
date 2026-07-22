import { Link } from "react-router-dom";
import type { Product } from "../lib/api";

export default function Home({ products, addToCart }: { products: Product[]; addToCart: (p: Product) => void }) {
  const featured = products.slice(0, 4);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0B0B12 0%,#171522 50%,#1B1730 100%)" }}>
        <div className="absolute w-[500px] h-[500px] rounded-full -top-40 -left-40 opacity-40"
          style={{ background: "#6C5CE7", filter: "blur(100px)" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full -bottom-32 -right-32 opacity-35"
          style={{ background: "#12C7B4", filter: "blur(90px)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 md:py-36 flex flex-col items-center text-center text-white">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl mb-8"
            style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)", boxShadow: "0 20px 50px rgba(108,92,231,.5)" }}>
            🍰
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            Arzum Şirniyyat
          </h1>
          <p className="text-white/50 text-lg md:text-xl mb-8 max-w-md">
            Şirin dadların ünvanı — ən keyfiyyətli şirniyyat və desertlər
          </p>
          <div className="flex gap-3">
            <Link to="/menu" className="px-8 py-3.5 rounded-xl font-bold text-sm text-white transition hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)", boxShadow: "0 6px 24px rgba(108,92,231,.4)" }}>
              Menyuya bax
            </Link>
            <Link to="/about" className="px-8 py-3.5 rounded-xl font-bold text-sm text-white/70 border border-white/15 hover:bg-white/5 transition">
              Haqqımızda
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured ── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Seçilmiş məhsullar</h2>
            <p className="text-gray-400 text-sm">Ən populyar Desertlarımız</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map(p => (
              <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-full h-32 rounded-xl mb-4 flex items-center justify-center text-4xl"
                  style={{ background: "linear-gradient(135deg,rgba(108,92,231,.08),rgba(18,199,180,.06))" }}>
                  🍰
                </div>
                <h3 className="font-bold text-sm text-gray-900 mb-1">{p.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold" style={{ color: "#6C5CE7" }}>₼{p.price.toFixed(2)}</span>
                  <button onClick={() => addToCart(p)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg transition hover:scale-110"
                    style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/menu" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>
              Bütün menyunu gör
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
        </section>
      )}

      {/* ── About snippet ── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5"
              style={{ background: "linear-gradient(135deg,rgba(108,92,231,.12),rgba(18,199,180,.08))" }}>
              ✨
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Niyə bizi seçməlisiniz?</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Hər bir məhsulumuz ən keyfiyyətli inqrediyentlərdən hazırlanır. Təzəlik və dad keyfiyyəti bizim üçün ən vacibdir.
            </p>
            <Link to="/about" className="text-sm font-bold" style={{ color: "#6C5CE7" }}>Ətraflı →</Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {[
              { icon: "🏆", title: "Keyfiyyət", desc: "Ən yaxşı inqrediyentlər" },
              { icon: "🚚", title: "Çatdırılma", desc: "Sürətli və vaxtında" },
              { icon: "💳", title: "Rahat ödəniş", desc: "Nağd və kartla" },
              { icon: "⭐", title: "Müştəri məmnuniyyəti", desc: "100% zəmanət" },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h4 className="font-bold text-sm text-gray-900">{f.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">Sifariş etmək istəyirsiniz?</h2>
        <p className="text-gray-400 text-sm mb-6">Menyumuza baxın və sevimli desertınızı seçin</p>
        <Link to="/menu" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)", boxShadow: "0 6px 24px rgba(108,92,231,.35)" }}>
          Sifariş et
        </Link>
      </section>
    </div>
  );
}
