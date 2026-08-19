export default function About() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#FFFBF5,#FFF5F5)" }}>
      {/* Hero */}
      <section className="py-20 md:py-28 text-center px-5" data-reveal>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400 mb-3 block">Bizim hekayəmiz</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">Haqqımızda</h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
          Arzum Şirniyyat olaraq ən keyfiyyətli məhsulları ən gözəl dadlarla sizə təqdim edirik
        </p>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-5 pb-20" data-reveal>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="rounded-[2rem] h-80 md:h-[26rem] flex items-center justify-center text-7xl overflow-hidden"
              style={{ background: "linear-gradient(135deg,#FFF5F5,#FFFBEB)" }}>
              <span className="animate-float">🍰</span>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "linear-gradient(135deg,#FEF3C7,#FDE68A)" }}>🏆</div>
                <div>
                  <div className="font-display font-bold text-gray-900">5+ İl</div>
                  <div className="text-xs text-gray-400">Təcrübə</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-3 block">Hekayəmiz</span>
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-5">Sevgi ilə başlamış hekayə</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Arzum Şirniyyat, keyfiyyətli şirniyyat və desertləri Azərbaycan xalqına təqdim etmək məqsədi ilə yaradılmışdır. Hər bir məhsulumuz sevgi və peşəkarlıqla hazırlanır.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Biz, ən təzə inqrediyentlərdən istifadə edərək, ənənəvi və müasir reseptləri birləşdiririk. Məqsədimiz — hər bir müştərimizə unudulmaz dad təcrübəsi təqdim etməkdir.
            </p>
            <div className="flex flex-wrap gap-4">
              {["Təbii inqrediyentlər", "Ənənəvi reseptlər", "Sevgi ilə hazırlanır"].map((t, i) => (
                <span key={i} className="px-4 py-2 rounded-full text-xs font-bold bg-rose-50 text-rose-500 border border-rose-100">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20" style={{ background: "linear-gradient(180deg,#FFF5F5,#FFFBF5)" }} data-reveal>
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400 mb-3 block">Səyahətimiz</span>
            <h2 className="font-display text-3xl font-bold text-gray-900">Xronologiya</h2>
          </div>
          <div className="max-w-3xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-rose-200 hidden md:block" />
            <div className="space-y-10">
              {[
                { year: "2020", title: "İlk addım", desc: "Arzum Şirniyyat kiçik bir emalatxana olaraq fəaliyyətə başladı. İlk müştərilərimizə ev şirniyyatları təqdim edirdik.", emoji: "🚀" },
                { year: "2021", title: "Böyümə dövrü", desc: "Məhsul çeşidimizi genişləndirdik və ilk kafe məkanımızı açdıq. Müştəri sayımız iki dəfə artdı.", emoji: "📈" },
                { year: "2022", title: "Keyfiyyət sertifikatı", desc: "Beynəlxalq keyfiyyət standartlarına uyğun sertifikat aldıq. Təbii inqrediyentlərə keçid etdik.", emoji: "🏅" },
                { year: "2023", title: "Onlayn sifariş", desc: "Online sifariş sistemimizi işə saldıq. Artıq müştərilərimiz evdən çıxmadan desert sifariş edə bilirdi.", emoji: "💻" },
                { year: "2024", title: "Genişlənmə", desc: "İkinci filialımızı açdıq və çatdırılma xidmətimizi genişləndirdik. Komandamız 20 nəfərə çatdı.", emoji: "🎯" },
                { year: "2025", title: "Yeniliklər", desc: "Menyumuza 50-dən çox yeni desert əlavə etdik. Müştəri məmnuniyyəti 98% səviyyəsinə çatdı.", emoji: "✨" },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                  {/* Dot + year */}
                  <div className="hidden md:flex flex-col items-center shrink-0">
                    <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-lg shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                      style={{ background: "linear-gradient(135deg,#F43F5E,#E11D48)" }}>
                      <span className="text-white">{item.emoji}</span>
                    </div>
                  </div>
                  {/* Card */}
                  <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold text-rose-500 bg-rose-50 mb-3">{item.year}</span>
                    <h3 className="font-display font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20" data-reveal>
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-3 block">Dəyərlərimiz</span>
            <h2 className="font-display text-3xl font-bold text-gray-900">Niyə bizi seçməlisiniz?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { emoji: "🏆", title: "Keyfiyyət", desc: "Ən yaxşı inqrediyentlərdən istifadə edirik. Hər addımda keyfiyyətə nəzarət edirik.", color: "#FEF3C7" },
              { emoji: "❤️", title: "Sevgi", desc: "Hər bir məhsulumuzu sevgi ilə hazırlayırıq. Dadımızda fərqi hiss edəcəksiniz.", color: "#FFE4E6" },
              { emoji: "🌿", title: "Təzəlik", desc: "Hər gün təzə məhsullar hazırlayırıq. Süfrənizə ən təzə dadları gətiririk.", color: "#ECFDF5" },
            ].map((v, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center group reveal"
                style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-4xl transition group-hover:scale-110"
                  style={{ background: v.color }}>{v.emoji}</div>
                <h3 className="font-display font-bold text-lg text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20" data-reveal>
        <div className="max-w-7xl mx-auto px-5">
          <div className="rounded-[2rem] p-10 md:p-14 text-center text-white overflow-hidden relative"
            style={{ background: "linear-gradient(135deg,#F43F5E,#E11D48,#BE123C)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3"
              style={{ background: "radial-gradient(circle,#FBBF24,transparent 70%)" }} />
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-10 relative z-10">Rəqəmlərlə biz</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              {[
                { n: "500+", label: "Məhsul növü" },
                { n: "10K+", label: "Müştəri" },
                { n: "5+", label: "İl təcrübə" },
                { n: "100%", label: "Keyfiyyət" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="font-display text-3xl md:text-4xl font-bold mb-1">{s.n}</div>
                  <div className="text-white/70 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
