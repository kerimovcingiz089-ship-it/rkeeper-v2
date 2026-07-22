import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function LoginScreen() {
  const { login, data } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const ok = await login(username.trim(), password);
      if (!ok) {
        setError("İstifadəçi adı və ya şifrə yanlışdır");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (field: string) => ({
    background: "rgba(255,255,255,.06)",
    border: `1.5px solid ${focused === field ? "#12C7B4" : "rgba(255,255,255,.12)"}`,
    boxShadow: focused === field ? "0 0 0 3px rgba(18,199,180,.12)" : "none",
  });

  return (
    <div className="fixed inset-0 flex z-[500] overflow-hidden">
      {/* ── LEFT: Brand panel ── */}
      <div className="hidden lg:flex relative flex-col items-center justify-center w-[52%] overflow-hidden"
        style={{ background: "linear-gradient(160deg,#0B0B12 0%,#171522 45%,#1B1730 100%)" }}>

        {/* Animated blobs */}
        <div className="absolute w-[500px] h-[500px] rounded-full -top-32 -left-32 opacity-50 animate-[floatBlob_11s_ease-in-out_infinite]"
          style={{ background: "#6C5CE7", filter: "blur(90px)" }} />
        <div className="absolute w-[420px] h-[420px] rounded-full -bottom-40 -right-24 opacity-45 animate-[floatBlob_11s_ease-in-out_infinite_-3.5s]"
          style={{ background: "#12C7B4", filter: "blur(80px)" }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-25 animate-[floatBlob_11s_ease-in-out_infinite_-7s]"
          style={{ background: "#E0A23B", filter: "blur(70px)", top: "35%", left: "55%" }} />

        {/* Content */}
        <div className="relative z-10 text-center text-white px-10">
          {/* Logo */}
          <div className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center text-5xl"
            style={{
              background: "linear-gradient(135deg,#6C5CE7,#12C7B4)",
              boxShadow: "0 20px 50px rgba(108,92,231,.5)",
            }}>
            🍰
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight mb-3">{data.settings.name}</h1>
          <p className="text-white/50 text-base font-medium">Şirin dadların ünvanı</p>

          {/* Decorative dots */}
          <div className="flex items-center justify-center gap-2 mt-10">
            <div className="w-2 h-2 rounded-full bg-[#6C5CE7] opacity-60" />
            <div className="w-2 h-2 rounded-full bg-[#12C7B4] opacity-60" />
            <div className="w-2 h-2 rounded-full bg-[#E0A23B] opacity-60" />
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login form ── */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(170deg,#13111C 0%,#1A1726 50%,#161425 100%)" }}>

        {/* Subtle blobs */}
        <div className="absolute w-[350px] h-[350px] rounded-full -top-20 -right-20 opacity-30 animate-[floatBlob_13s_ease-in-out_infinite]"
          style={{ background: "#6C5CE7", filter: "blur(80px)" }} />
        <div className="absolute w-[300px] h-[300px] rounded-full -bottom-28 -left-16 opacity-25 animate-[floatBlob_13s_ease-in-out_infinite_-5s]"
          style={{ background: "#12C7B4", filter: "blur(70px)" }} />

        {/* Mobile logo (shown on small screens) */}
        <div className="lg:hidden absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-3 text-white">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>
            🍰
          </div>
          <span className="font-extrabold text-lg">{data.settings.name}</span>
        </div>

        {/* Card */}
        <div className={`relative z-10 w-[400px] max-w-[88vw] rounded-3xl p-9 text-white transition-all
            ${shake ? "animate-[shakeAnim_.4s]" : ""}`}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 30px 90px rgba(0,0,0,.45)",
          }}>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight mb-1">Xoş gəlmisiniz</h2>
            <p className="text-white/45 text-sm">Hesabınıza daxil olun</p>
          </div>

          {/* Mobile heading */}
          <div className="lg:hidden text-center mb-7">
            <h2 className="text-xl font-extrabold tracking-tight mb-1">Xoş gəlmisiniz</h2>
            <p className="text-white/45 text-sm">Hesabınıza daxil olun</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">İstifadəçi adı</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm opacity-60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input
                  type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Istifadəçi adı"
                  disabled={loading}
                  onFocus={() => setFocused("user")}
                  onBlur={() => setFocused(null)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none transition disabled:opacity-50"
                  style={inputStyle("user")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">Şifrə</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm opacity-60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Şifrənizi daxil edin"
                  disabled={loading}
                  onFocus={() => setFocused("pass")}
                  onBlur={() => setFocused(null)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none transition disabled:opacity-50"
                  style={inputStyle("pass")}
                />
              </div>
            </div>

            {/* Error */}
            <div className="min-h-[20px]">
              {error && (
                <p className="text-[#FF9393] text-xs font-semibold flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  {error}
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || !username || !password}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white mt-1 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg,#6C5CE7,#12C7B4)",
                boxShadow: "0 6px 24px rgba(108,92,231,.4)",
              }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Giriş edilir...</>
              ) : (
                <>
                  Daxil ol
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
