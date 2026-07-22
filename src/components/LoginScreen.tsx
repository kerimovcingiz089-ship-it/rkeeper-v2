import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function LoginScreen() {
  const { login, data } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden z-[500]"
      style={{ background: "linear-gradient(160deg,#0B0B12,#171522 55%,#1B1730)" }}>

      {/* Blobs */}
      <div className="blob absolute w-[440px] h-[440px] rounded-full -top-28 -left-24 opacity-50 animate-[floatBlob_11s_ease-in-out_infinite]"
        style={{ background: "#6C5CE7", filter: "blur(75px)" }} />
      <div className="blob absolute w-[400px] h-[400px] rounded-full -bottom-36 -right-20 opacity-45 animate-[floatBlob_11s_ease-in-out_infinite_-3.5s]"
        style={{ background: "#12C7B4", filter: "blur(75px)" }} />
      <div className="blob absolute w-[320px] h-[320px] rounded-full opacity-30 animate-[floatBlob_11s_ease-in-out_infinite_-7s]"
        style={{ background: "#E0A23B", filter: "blur(75px)", top: "38%", left: "58%" }} />

      {/* Card */}
      <div className={`relative z-10 w-[390px] max-w-[90vw] rounded-3xl p-10 text-center text-white transition-all
          ${shake ? "animate-[shakeAnim_.4s]" : ""}`}
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          boxShadow: "0 30px 90px rgba(0,0,0,.5)"
        }}>

        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl font-extrabold shadow-lg"
          style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)", boxShadow: "0 12px 28px rgba(108,92,231,.45)" }}>
          🍰
        </div>

        <h1 className="text-[22px] font-extrabold mb-1 tracking-tight">Xoş gəlmisiniz</h1>
        <div className="text-[13px] text-white/75 font-semibold mb-1">{data.settings.name}</div>
        <div className="text-[12px] text-white/50 italic mb-6">Şirin dadların ünvanı ✨</div>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          {/* Username */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-75">👤</span>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="İstifadəçi adı"
              disabled={loading}
              className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none transition disabled:opacity-50"
              style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)" }}
              onFocus={e => (e.target.style.borderColor = "#12C7B4")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.16)")}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-75">🔒</span>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Şifrə"
              disabled={loading}
              className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none transition disabled:opacity-50"
              style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)" }}
              onFocus={e => (e.target.style.borderColor = "#12C7B4")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.16)")}
            />
          </div>

          {error && <p className="text-[#FF9393] text-[12.5px] font-semibold min-h-[18px]">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-[14.5px] text-white mt-2 transition hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)", boxShadow: "0 4px 14px rgba(108,92,231,.4)" }}>
            {loading ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Giriş edilir...</>) : "Daxil ol"}
          </button>
        </form>

        <div className="mt-5 text-[11.5px] text-white/45 rounded-xl p-3 leading-relaxed"
          style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>
          Demo hesablar:<br />
          <b>admin / admin123</b> — Admin &nbsp;·&nbsp; <b>kassa / kassa123</b> — Kassir
        </div>
      </div>
    </div>
  );
}
