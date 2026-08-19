import { useApp } from "../context/AppContext";
import logo from "../logo.png";
import { initialsOf } from "../lib/utils";

const NAV = [
  { id: "tables",   key: "nav.tables",   icon: "⊞" },
  { id: "takeaway", key: "nav.takeaway", icon: "📦" },
  { id: "online",   key: "nav.online",   icon: "🌐", badge: true as const },
  { id: "stock",    key: "nav.stock",    icon: "🗂" },
  { id: "menu",     key: "nav.menu",     icon: "☰" },
  { id: "reports",  key: "nav.reports",  icon: "📊" },
  { id: "users",    key: "nav.users",    icon: "👥" },
  { id: "settings", key: "nav.settings", icon: "⚙" },
] as const;

const ROLE_NAV: Record<string, string[]> = {
  admin: ["tables", "order", "takeaway", "online", "stock", "menu", "reports", "users", "settings"],
  kassa: ["tables", "order", "takeaway", "online", "stock"],
};

export default function Sidebar() {
  const { currentUser, currentView, switchView, logout, newOnlineOrdersCount, t } = useApp();
  if (!currentUser) return null;

  const allowed = ROLE_NAV[currentUser.role] || [];
  const isAdmin = currentUser.role === "admin";

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────── */}
      <aside className="hidden md:flex flex-col items-center w-20 bg-[#14151C] py-4 flex-shrink-0 h-screen z-20">
        {/* Brand */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden mb-6 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)", boxShadow: "0 8px 18px rgba(250,187,24,.35)" }}>
          <img src={logo} alt="Logo" className="w-full h-full object-contain" />
        </div>

        {/* Nav */}
        <nav className="flex flex-col items-center gap-1.5 flex-1 w-full px-2">
          {NAV.filter(n => allowed.includes(n.id)).map(n => (
            <button key={n.id}
              onClick={() => switchView(n.id as any)}
              className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-bold tracking-wide transition-all relative cursor-pointer
                ${currentView === n.id
                  ? "text-white"
                  : "text-[#9088A0] hover:bg-[#1B1D27] hover:text-white"}`}
              style={currentView === n.id
                ? { background: "linear-gradient(135deg,rgba(250,187,24,.4),rgba(212,160,23,.25))" }
                : {}}>
              <span className="text-base">{n.icon}</span>
              {t(n.key)}
              {"badge" in n && n.badge && newOnlineOrdersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-extrabold text-white px-1"
                  style={{ background: "linear-gradient(135deg,#FF6B6B,#EE5A24)", boxShadow: "0 2px 8px rgba(255,107,107,.5)" }}>
                  {newOnlineOrdersCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-1 pt-3 flex-shrink-0">
          <button onClick={logout}
            title={`${currentUser.name} — ${t("nav.logout")}`}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold transition hover:scale-110 cursor-pointer"
            style={{ background: isAdmin ? "linear-gradient(135deg,#FABB18,#F5D060)" : "linear-gradient(135deg,#D4A017,#E8B830)" }}>
            {initialsOf(currentUser.name)}
          </button>
          <span className="text-[8.5px] text-[#716A88] uppercase tracking-wider font-bold">
            {isAdmin ? t("nav.admin") : t("nav.cashier")}
          </span>
        </div>
      </aside>

      {/* ── Mobile bottom nav ─────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#14151C] flex items-center justify-around px-2 py-2 border-t border-white/10">
        {NAV.filter(n => allowed.includes(n.id)).slice(0, 5).map(n => (
          <button key={n.id}
            onClick={() => switchView(n.id as any)}
            className={`flex flex-col items-center gap-0.5 text-[8px] font-bold tracking-wide px-2 py-1 rounded-xl transition-all relative cursor-pointer
              ${currentView === n.id ? "text-white" : "text-[#9088A0]"}`}
            style={currentView === n.id
              ? { background: "linear-gradient(135deg,rgba(250,187,24,.5),rgba(212,160,23,.3))" }
              : {}}>
            <span className="text-base">{n.icon}</span>
            {t(n.key)}
            {"badge" in n && n.badge && newOnlineOrdersCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8px] font-extrabold text-white px-0.5"
                style={{ background: "linear-gradient(135deg,#FF6B6B,#EE5A24)" }}>
                {newOnlineOrdersCount}
              </span>
            )}
          </button>
        ))}
        <button onClick={logout}
          className="flex flex-col items-center gap-0.5 text-[8px] font-bold tracking-wide text-[#9088A0] px-2 py-1 cursor-pointer">
          <span className="text-base">🚪</span>
          {t("nav.logout")}
        </button>
      </nav>
    </>
  );
}
