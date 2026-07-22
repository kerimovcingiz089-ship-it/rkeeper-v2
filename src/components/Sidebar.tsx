import { useApp } from "../context/AppContext";
import { initialsOf } from "../lib/utils";

const NAV = [
  { id: "tables",   label: "Masalar",      icon: "⊞" },
  { id: "takeaway", label: "Paket",         icon: "📦" },
  { id: "stock",    label: "Stok",          icon: "🗂" },
  { id: "menu",     label: "Menyu",         icon: "☰" },
  { id: "reports",  label: "Hesabat",       icon: "📊" },
  { id: "users",    label: "İstifadəçilər", icon: "👥" },
  { id: "settings", label: "Ayarlar",       icon: "⚙" },
] as const;

const ROLE_NAV: Record<string, string[]> = {
  admin: ["tables", "order", "takeaway", "stock", "menu", "reports", "users", "settings"],
  kassa: ["tables", "order", "takeaway", "stock", "reports"],
};

export default function Sidebar() {
  const { currentUser, currentView, switchView, logout } = useApp();
  if (!currentUser) return null;

  const allowed = ROLE_NAV[currentUser.role] || [];
  const isAdmin = currentUser.role === "admin";

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────── */}
      <aside className="hidden md:flex flex-col items-center w-20 bg-[#14151C] py-4 flex-shrink-0 h-screen z-20">
        {/* Brand */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-6 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)", boxShadow: "0 8px 18px rgba(108,92,231,.35)" }}>
          🍰
        </div>

        {/* Nav */}
        <nav className="flex flex-col items-center gap-1.5 flex-1 w-full px-2">
          {NAV.filter(n => allowed.includes(n.id)).map(n => (
            <button key={n.id}
              onClick={() => switchView(n.id as any)}
              className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-bold tracking-wide transition-all
                ${currentView === n.id
                  ? "text-white"
                  : "text-[#9088A0] hover:bg-[#1B1D27] hover:text-white"}`}
              style={currentView === n.id
                ? { background: "linear-gradient(135deg,rgba(108,92,231,.4),rgba(18,199,180,.25))" }
                : {}}>
              <span className="text-base">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-1 pt-3 flex-shrink-0">
          <button onClick={logout}
            title={`${currentUser.name} — Çıxış`}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold transition hover:scale-110"
            style={{ background: isAdmin ? "linear-gradient(135deg,#6C5CE7,#9C8CFF)" : "linear-gradient(135deg,#12C7B4,#4FE3CD)" }}>
            {initialsOf(currentUser.name)}
          </button>
          <span className="text-[8.5px] text-[#716A88] uppercase tracking-wider font-bold">
            {isAdmin ? "Admin" : "Kassir"}
          </span>
        </div>
      </aside>

      {/* ── Mobile bottom nav ─────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#14151C] flex items-center justify-around px-2 py-2 border-t border-white/10">
        {NAV.filter(n => allowed.includes(n.id)).slice(0, 5).map(n => (
          <button key={n.id}
            onClick={() => switchView(n.id as any)}
            className={`flex flex-col items-center gap-0.5 text-[8px] font-bold tracking-wide px-2 py-1 rounded-xl transition-all
              ${currentView === n.id ? "text-white" : "text-[#9088A0]"}`}
            style={currentView === n.id
              ? { background: "linear-gradient(135deg,rgba(108,92,231,.5),rgba(18,199,180,.3))" }
              : {}}>
            <span className="text-base">{n.icon}</span>
            {n.label}
          </button>
        ))}
        <button onClick={logout}
          className="flex flex-col items-center gap-0.5 text-[8px] font-bold tracking-wide text-[#9088A0] px-2 py-1">
          <span className="text-base">🚪</span>
          Çıxış
        </button>
      </nav>
    </>
  );
}
