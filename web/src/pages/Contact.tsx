import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setName(""); setPhone(""); setMsg("");
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#FFFBF5,#FFF5F5)" }}>
      {/* Header */}
      <section className="py-20 md:py-28 text-center px-5">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400 mb-3 block">Əlaqə</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">Bizimlə əlaqə</h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">Suallarınız var? Bizimlə əlaqə saxlayın, sizə kömək edək</p>
      </section>

      <div className="max-w-7xl mx-auto px-5 pb-20">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Form */}
          <div className="md:col-span-3 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Mesaj göndərin</h2>
            {sent ? (
              <div className="text-center py-14">
                <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl"
                  style={{ background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)" }}>✅</div>
                <p className="font-display font-bold text-lg text-gray-900 mb-1">Mesajınız göndərildi!</p>
                <p className="text-sm text-gray-400">Tezliklə sizinlə əlaqə saxlayacağıq</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Adınız</label>
                  <input value={name} onChange={e => setName(e.target.value)} required
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Telefon</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} required type="tel"
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Mesaj</label>
                  <textarea value={msg} onChange={e => setMsg(e.target.value)} required rows={5}
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition resize-none" />
                </div>
                <button type="submit"
                  className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg,#F43F5E,#E11D48)", boxShadow: "0 6px 24px rgba(244,63,94,.25)" }}>
                  Göndər
                </button>
              </form>
            )}
          </div>

          {/* Info sidebar */}
          <div className="md:col-span-2 space-y-5">
            {[
              { emoji: "📞", title: "Telefon", value: "+994 XX XXX XX XX", bg: "#FFF1F2" },
              { emoji: "📍", title: "Ünvan", value: "Bakı, Azərbaycan", bg: "#FEF3C7" },
              { emoji: "📧", title: "Email", value: "info@arzum.az", bg: "#ECFDF5" },
              { emoji: "🕐", title: "İş vaxtı", value: "Hər gün 09:00 — 22:00", bg: "#F5F3FF" },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: c.bg }}>{c.emoji}</div>
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{c.title}</div>
                  <div className="text-sm font-semibold text-gray-700">{c.value}</div>
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="rounded-2xl h-44 flex items-center justify-center text-gray-300 text-sm font-semibold border border-gray-100 overflow-hidden"
              style={{ background: "linear-gradient(135deg,#F5F5F4,#E7E5E4)" }}>
              <div className="text-center">
                <div className="text-3xl mb-2">🗺</div>
                <div>Xəritə tezliklə əlavə olunacaq</div>
              </div>
            </div>

            {/* Social */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-display font-bold text-sm text-gray-900 mb-3">Bizi izləyin</h3>
              <div className="flex gap-2.5">
                {[
                  { label: "Instagram", color: "#E11D48" },
                  { label: "Facebook", color: "#2563EB" },
                  { label: "WhatsApp", color: "#16A34A" },
                ].map(s => (
                  <a key={s.label} href="#"
                    className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ background: s.color }}>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
