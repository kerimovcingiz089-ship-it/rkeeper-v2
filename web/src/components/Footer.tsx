import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: "linear-gradient(180deg,#1a1a1a 0%,#111 100%)" }}>
      {/* Decorative top border */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#F43F5E,#F59E0B,#F43F5E)" }} />

      <div className="max-w-7xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "linear-gradient(135deg,#F43F5E,#F59E0B)" }}>🍰</div>
              <div>
                <span className="font-display font-bold text-xl text-white">Arzum</span>
                <span className="font-display font-bold text-xl text-rose-400 ml-1">Şirniyyat</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Ən keyfiyyətli şirniyyat və desertləri sevgi ilə hazırlayırıq. Hər bir məhsulumuz sizə unudulmaz dad təcrübəsi bəxş edir.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 mt-6">
              {[
                { label: "Instagram", path: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z" },
                { label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { label: "WhatsApp", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" },
              ].map((s) => (
                <a key={s.label} href="#" title={s.label}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 text-gray-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={s.path}/></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="font-display font-bold text-white text-sm mb-4">Səhifələr</h4>
            <div className="space-y-2.5">
              {[
                { to: "/", label: "Ana səhifə" },
                { to: "/menu", label: "Menyumuz" },
                { to: "/about", label: "Haqqımızda" },
                { to: "/contact", label: "Əlaqə" },
              ].map(l => (
                <Link key={l.to} to={l.to} className="block text-gray-400 text-sm hover:text-rose-400 transition">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="font-display font-bold text-white text-sm mb-4">Əlaqə</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs">📍</span>
                <span>Bakı, Azərbaycan</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs">📞</span>
                <span>+994 XX XXX XX XX</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs">🕐</span>
                <span>Hər gün 09:00 — 22:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2026 Arzum Şirniyyat. Bütün hüquqlar qorunur.</p>
          <p className="text-xs text-gray-600">Sevgi ilə hazırlanıb ❤️</p>
        </div>
      </div>
    </footer>
  );
}
