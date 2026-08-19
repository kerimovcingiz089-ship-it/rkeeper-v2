import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../lib/api";

const DESSERT_EMOJIS = ["🍰", "🧁", "🍮", "🍩", "🎂", "🍪", "🥧", "🍫"];

const TESTIMONIALS = [
  { name: "Leyla M.", role: "Müştəri", text: "Ən keyfiyyətli desertləri burada tapdım. Tortların dadına doyum olmur, hər bir lokma ayrı zövq verir!", rating: 5, color: "#FFF1F2" },
  { name: "Rəşad Ə.", role: "Daimi müştəri", text: "Sifarişim həmişə vaxtında çatdırılır. Qablaşdırma çox səliqəli və məhsullar təzə olur. Təşəkkürlər!", rating: 5, color: "#FEF3C7" },
  { name: "Aytən Q.", role: "Müştəri", text: "Ailəvi tədbirlər üçün ən yaxşı seçimdir. Hər kəs desertləri çox bəyənir. Şirniyyatlar həmişə təzə və dadlıdır.", rating: 5, color: "#ECFDF5" },
  { name: "Elvin P.", role: "Müştəri", text: "Keyfiyyətli inqrediyentlərdən hazırlanmış əsl ev şirniyyatı dadı. Mükəmməl xidmət və sürətli çatdırılma!", rating: 5, color: "#F5F3FF" },
];

const GALLERY_ITEMS = [
  { emoji: "🎂", label: "Doğum günü tortları", color: "from-pink-200 to-rose-200" },
  { emoji: "🧁", label: "Kapkeyklər", color: "from-amber-100 to-orange-200" },
  { emoji: "🍰", label: "Kremli tortlar", color: "from-purple-200 to-pink-200" },
  { emoji: "🍪", label: "Kekslər", color: "from-yellow-200 to-amber-200" },
  { emoji: "🥧", label: "Piroqlar", color: "from-green-200 to-teal-200" },
  { emoji: "🍫", label: "Şokoladlı desertlər", color: "from-brown-200 to-amber-300" },
];

export default function Home({ products, addToCart }: { products: Product[]; addToCart: (p: Product) => void }) {
  const featured = products.slice(0, 6);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx(prev => (prev + 1) % TESTIMONIALS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden" style={{ background: "linear-gradient(135deg,#FFF5F5 0%,#FFFBF5 30%,#FFFBEB 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full opacity-20 animate-float"
          style={{ background: "radial-gradient(circle,#F43F5E,transparent 70%)" }} />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 rounded-full opacity-15 animate-float" style={{ animationDelay: "2s" }} />
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
        <section className="py-20 md:py-28" data-reveal>
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400 mb-3 block">Seçilmişlər</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">Ən sevilən desertlarımız</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">Müştərilərimizin ən çox seçdiyi məhsullar</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((p, i) => (
                <div key={p.id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 reveal"
                  style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="relative h-48 flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(135deg,hsl(${(i * 40) % 360},80%,97%),hsl(${(i * 40 + 30) % 360},70%,95%))` }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                        {["🍰", "🧁", "🍮", "🍩", "🎂", "🍪"][i % 6]}
                      </span>
                    )}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">
                      ❤️
                    </div>
                  </div>
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

      {/* ── Testimonials ── */}
      <section className="py-20 md:py-28" style={{ background: "linear-gradient(180deg,#FFFBF5,#FFF5F5)" }} data-reveal>
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400 mb-3 block">Müştəri rəyləri</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">Onlar nə deyir?</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">Müştərilərimizin sözləri ən yaxşı tərifdir</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative overflow-hidden min-h-[220px]">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className={`transition-all duration-500 absolute inset-0 ${i === testimonialIdx ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
                  <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-sm text-center">
                    <div className="flex justify-center gap-1 mb-5">
                      {Array.from({ length: t.rating }).map((_, ri) => (
                        <svg key={ri} width="20" height="20" viewBox="0 0 20 20" fill="#F59E0B"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 italic">"{t.text}"</p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg,#F43F5E,#E11D48)" }}>
                        {t.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm text-gray-900">{t.name}</div>
                        <div className="text-xs text-gray-400">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === testimonialIdx ? "w-8 bg-rose-400" : "bg-gray-300 hover:bg-gray-400"}`}
                  aria-label={`Rəy ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="py-20 md:py-28" data-reveal>
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
              <div key={i} className="bg-white rounded-3xl p-7 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group reveal"
                style={{ transitionDelay: `${i * 0.1}s` }}>
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

      {/* ── Gallery ── */}
      <section className="py-20 md:py-28" style={{ background: "linear-gradient(180deg,#FFF5F5,#FFFBF5)" }} data-reveal>
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400 mb-3 block">Qalereya</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">Məhsullarımızdan görüntülər</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">Hər bir məhsul sevgi ilə hazırlanır</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY_ITEMS.map((item, i) => (
              <div key={i} className={`group relative rounded-3xl overflow-hidden cursor-pointer reveal`}
                style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className={`aspect-square flex items-center justify-center bg-gradient-to-br ${item.color}`}>
                  <span className="text-6xl md:text-7xl transition-all duration-500 group-hover:scale-125 group-hover:rotate-6">{item.emoji}</span>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-white font-bold text-sm md:text-base px-4 text-center">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 md:py-28" data-reveal>
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-3 block">FAQ</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">Tez-tez soruşulanlar</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">Sifarişlə bağlı ən çox verilən suallar</p>
          </div>
          <div className="space-y-3">
            {[
              { q: "Sifarişi necə edə bilərəm?", a: "Menyumuzdan istədiyiniz məhsulları seçib, səbətə əlavə edərək asanlıqla sifariş edə bilərsiniz." },
              { q: "Çatdırılma nə qədər çəkir?", a: "Sifarişiniz hazırlandıqdan sonra, ümumilikdə 30-60 dəqiqə ərzində çatdırılır." },
              { q: "Hansı ödəniş üsulları mövcuddur?", a: "Nağd və ya kartla ödəniş edə bilərsiniz. Onlayn sifarişlərdə həmçinin kartla əvvəlcədən ödəmək mümkündür." },
              { q: "Məhsullarınız təbii inqrediyentlərdən hazırlanır?", a: "Bəli, bütün məhsullarımız tamamilə təbii inqrediyentlərdən, heç bir qatqı və əlavəsiz hazırlanır." },
            ].map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20" data-reveal>
        <div className="max-w-7xl mx-auto px-5">
          <div className="relative overflow-hidden rounded-[2rem] p-10 md:p-16 text-center text-white"
            style={{ background: "linear-gradient(135deg,#F43F5E 0%,#E11D48 50%,#BE123C 100%)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3"
              style={{ background: "radial-gradient(circle,#FBBF24,transparent 70%)" }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-20 translate-y-1/3 -translate-x-1/4"
              style={{ background: "radial-gradient(circle,#fff,transparent 70%)" }} />

            <div className="relative z-10">
              <span className="text-4xl mb-4 block animate-bounce-in">🧁</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Sifariş vermək istəyirsiniz?</h2>
              <p className="text-white/80 text-sm mb-8 max-w-md mx-auto">Menyumuza baxın və sevimli desertınızı seçin. Hər gün təzə məhsullar!</p>
              <Link to="/menu"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 animate-pulse-glow"
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

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
        <span className="font-semibold text-sm text-gray-800">{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          className={`shrink-0 text-rose-400 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="px-6 pb-5 text-sm text-gray-400 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}
