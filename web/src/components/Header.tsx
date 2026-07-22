import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV = [
  { to: "/", label: "Ana səhifə" },
  { to: "/menu", label: "Menyumuz" },
  { to: "/about", label: "Haqqımızda" },
  { to: "/contact", label: "Əlaqə" },
];

export default function Header({ cartCount }: { cartCount: number }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_20px_rgba(0,0,0,.06)]"
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-5 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all group-hover:scale-110 group-hover:rotate-3"
            style={{ background: "linear-gradient(135deg,#F43F5E,#F59E0B)", boxShadow: "0 4px 14px rgba(244,63,94,.25)" }}>
            🍰
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-bold text-lg text-gray-900 tracking-tight">Arzum</span>
            <span className="font-display font-bold text-lg text-rose-500 tracking-tight ml-1">Şirniyyat</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full px-1.5 py-1 border border-gray-100">
          {NAV.map(n => (
            <Link key={n.to} to={n.to}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
                ${loc.pathname === n.to
                  ? "bg-gray-900 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white"}`}>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Cart + Mobile toggle */}
        <div className="flex items-center gap-2">
          <Link to="/menu" className="relative p-2.5 rounded-2xl hover:bg-rose-50 transition-all group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="text-gray-600 group-hover:text-rose-500 transition">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] flex items-center justify-center rounded-full text-[10px] font-extrabold text-white px-1 animate-scale-in"
                style={{ background: "linear-gradient(135deg,#F43F5E,#E11D48)", boxShadow: "0 2px 8px rgba(244,63,94,.4)" }}>
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2.5 rounded-2xl hover:bg-rose-50 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-600">
              {open ? (<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>) :
                (<><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></>)}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 animate-fade-up">
          <nav className="p-4 space-y-1">
            {NAV.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={`block px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all
                  ${loc.pathname === n.to ? "bg-rose-50 text-rose-600" : "text-gray-500 hover:bg-gray-50"}`}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
