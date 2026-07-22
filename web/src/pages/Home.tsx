import { Link } from "react-router-dom";
import type { Product } from "../lib/api";

const DESSERT_EMOJIS = ["🍰", "🧁", "🍮", "🍩", "🎂", "🍪", "🥧", "🍫"];

export default function Home({ products, addToCart }: { products: Product[]; addToCart: (p: Product) => void }) {
  const featured = products.slice(0, 6);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden" style={{ background: "linear-gradient(135deg,#FFF5F5 0%,#FFFBF5 30%,#FFFBEB 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full opacity-20 animate-float"
          style={{ background: "radial-gradient(circle,#F43F5E,transparent 70%)" }} />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 rounded-full opacity-15 animate-float" style={{ animationDelay: "2s" }}
          style2={{}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#F59E0B,transparent 70%)" }} />

        {/* Floating dessert emojis */}
        {DESSERT_EMOJIS.map((e, i) => (
          <span key={i} className="absolute text-3xl opacity-20 animate-float hidden lg:block"
            style={{
              top: `${15 + (i * 10) % 70}%`,
              left: `${5 + (i * 13) % 85}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}>
            {e}
          </span>
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-5 w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-rose-100 mb-8 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-xs font-semibold text-rose-600">Ən təzə məhsullar hər gün</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold text-gray-900 leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Şirin dadların<br />
              <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                ünvanı
              </span>
            </h1>

            <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-10 max-w-lg animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Ən keyfiyyətli inqrediyentlərdən sevgi ilə hazırlanmış şirniyyat və desertlər
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/menu"
                className="group px-8 py-4 rounded-2xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-xl flex items-center gap-2.5"
                style={{ background: "linear-gradient(135deg,#F43F5E,#E11D48)", boxShadow: "0 8px 30px rgba(244,63,94,.3)" }}>
                Menyuna bax
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="transition group-hover:translate-x-1">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link to="/about"
                className="px-8 py-4 rounded-2xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:border-rose-200 hover:text-rose-600 hover:shadow-lg transition-all">
                Haqqımızda
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 mt-14 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              {[
                { n: "500+", label: "Məhsul" },
                { n: "10K+", label: "Müştəri" },
                { n: "5+", label: "İl təcrübə" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-display text-2xl font-bold text-gray-900">{s.n}</div>
                  <div className="text-xs text-gray-400 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400 mb-3 block">Seçilmişlər</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">Ən sevilən desertlarımız</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">Müştərilərimizin ən çox seçdiyi məhsullar</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((p, i) => (
                <div key={p.id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 0.05}s` }}>
                  {/* Image area */}
                  <div className="relative h-48 flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(135deg,hsl(${(i * 40) % 360},80%,97%),hsl(${(i * 40 + 30) % 360},70%,95%))` }}>
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                      {["🍰", "🧁", "🍮", "🍩", "🎂", "🍪"][i % 6]}
                    </span>
                    {/* Decorative dot */}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">
                      ❤️
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition">{p.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl font-bold text-rose-500">₼{p.price.toFixed(2)}</span>
                      <button onClick={() => addToCart(p)}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-all hover:scale-110 hover:shadow-lg"
                        style={{ background: "linear-gradient(135deg,#F43F5E,#E11D48)", boxShadow: "0 4px 12px rgba(244,63,94,.25)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/menu"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
                style={{ background: "linear-gradient(135deg,#F43F5E,#E11D48)", boxShadow: "0 6px 24px rgba(244,63,94,.25)" }}>
                Bütün menyunu gör
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Why Us ── */}
      <section className="py-20 md:py-28" style={{ background: "linear-gradient(180deg,#FFFBF5,#FFF5F5)" }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-3 block">Niyə biz?</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">Fərqimiz</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { emoji: "🏆", title: "Premium Keyfiyyət", desc: "Ən yaxşı inqrediyentlərdən istifadə edirik. Hər bir məhsul keyfiyyətə nəzarətdən keçir." },
              { emoji: "👨‍🍳", title: "Peşəkar Ustalar", desc: "Təcrübəli şirniyyatçılarımız ənənəvi və müasir texnikaları birləşdirir." },
              { emoji: "🌿", title: "Təbii Inqrediyentlər", desc: "Heç bir əlavə və qatqı olmadan, tamamilə təbii məhsullardan hazırlanır." },
              { emoji: "🚚", title: "Sürətli Çatdırılma", desc: "Sifarişinizə vaxtında çatdırırıq. Müştəri məmnuniyyəti prioritetimizdir." },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-3xl p-7 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 transition group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg,hsl(${i * 50 + 350},90%,96%),hsl(${i * 50 + 30},80%,94%))` }}>
                  {f.emoji}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="relative overflow-hidden rounded-[2rem] p-10 md:p-16 text-center text-white"
            style={{ background: "linear-gradient(135deg,#F43F5E 0%,#E11D48 50%,#BE123C 100%)" }}>
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3"
              style={{ background: "radial-gradient(circle,#FBBF24,transparent 70%)" }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-20 translate-y-1/3 -translate-x-1/4"
              style={{ background: "radial-gradient(circle,#fff,transparent 70%)" }} />

            <div className="relative z-10">
              <span className="text-4xl mb-4 block">🧁</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Sifariş vermək istəyirsiniz?</h2>
              <p className="text-white/80 text-sm mb-8 max-w-md mx-auto">Menyumuza baxın və sevimli desertınızı seçin. Hər gün təzə məhsullar!</p>
              <Link to="/menu"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: "white", color: "#E11D48", boxShadow: "0 8px 30px rgba(0,0,0,.15)" }}>
                Sifariş et
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
