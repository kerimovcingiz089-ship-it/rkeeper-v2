export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-3xl"
          style={{ background: "linear-gradient(135deg,rgba(108,92,231,.12),rgba(18,199,180,.08))" }}>
          ✨
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Haqqımızda</h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
          Arzum Şirniyyat olaraq ən keyfiyyətli məhsulları ən gözəl dadlarla sizə təqdim edirik
        </p>
      </div>

      {/* Story */}
      <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
        <div className="rounded-3xl h-64 md:h-80 flex items-center justify-center text-6xl"
          style={{ background: "linear-gradient(135deg,rgba(108,92,231,.1),rgba(18,199,180,.07))" }}>
          🍰
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Hekayəmiz</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Arzum Şirniyyat, keyfiyyətli şirniyyat və desertləri Azərbaycan xalqına təqdim etmək məqsədi ilə yaradılmışdır. Hər bir məhsulumuz sevgi və peşəkarlıqla hazırlanır.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Biz, ən təzə inqrediyentlərdən istifadə edərək, ənənəvi və müasir reseptləri birləşdiririk. Məqsədimiz — hər bir müştərimizə unudulmaz dad təcrübəsi təqdim etməkdir.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
        {[
          { icon: "🏆", title: "Keyfiyyət", desc: "Ən yaxşı inqrediyentlərdən istifadə edirik. Hər addımda keyfiyyətə nəzarət edirik." },
          { icon: "❤️", title: "Sevgi", desc: "Hər bir məhsulumuzu sevgi ilə hazırlayırıq. Dadımızda fərqi hiss edəcəksiniz." },
          { icon: "🌿", title: "Təzəlik", desc: "Hər gün təzə məhsullar hazırlayırıq. Süfrənizə ən təzə dadları gətiririk." },
        ].map((v, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-7 text-center hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">{v.icon}</div>
            <h3 className="font-extrabold text-base text-gray-900 mb-2">{v.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="rounded-3xl p-10 text-center text-white"
        style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>
        <h2 className="text-2xl font-extrabold mb-8">Rəqəmlərlə biz</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: "500+", label: "Məhsul növü" },
            { n: "10K+", label: "Müştəri" },
            { n: "5+", label: "İl təcrübə" },
            { n: "100%", label: "Keyfiyyət" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-extrabold mb-1">{s.n}</div>
              <div className="text-white/70 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
