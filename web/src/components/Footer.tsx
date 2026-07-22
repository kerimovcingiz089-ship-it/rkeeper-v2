export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>🍰</div>
              <span className="font-extrabold text-lg">Arzum Şirniyyat</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Şirin dadların ünvanı. Ən keyfiyyətli məhsullar, ən gözəl dadlar — sizin üçün.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4">Keçidlər</h4>
            <div className="space-y-2">
              <a href="/menu" className="block text-gray-400 text-sm hover:text-white transition">Menyu</a>
              <a href="/about" className="block text-gray-400 text-sm hover:text-white transition">Haqqımızda</a>
              <a href="/contact" className="block text-gray-400 text-sm hover:text-white transition">Əlaqə</a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4">Əlaqə</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>📞 +994 XX XXX XX XX</p>
              <p>📍 Bakı, Azərbaycan</p>
              <p>🕐 Hər gün 09:00 — 22:00</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-gray-500">
          © 2026 Arzum Şirniyyat. Bütün hüquqlar qorunur.
        </div>
      </div>
    </footer>
  );
}
