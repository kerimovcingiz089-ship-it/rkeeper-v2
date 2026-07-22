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
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Əlaqə</h1>
        <p className="text-gray-400 text-sm">Suallarınız var? Bizimlə əlaqə saxlayın</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Form */}
        <div className="bg-white border border-gray-100 rounded-3xl p-7">
          <h2 className="font-extrabold text-lg text-gray-900 mb-5">Mesaj göndərin</h2>
          {sent ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
                style={{ background: "linear-gradient(135deg,rgba(18,199,180,.12),rgba(108,92,231,.08))" }}>✓</div>
              <p className="font-bold text-gray-900">Mesajınız göndərildi!</p>
              <p className="text-sm text-gray-400 mt-1">Tezliklə sizinlə əlaqə saxlayacağıq</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Adınız</label>
                <input value={name} onChange={e => setName(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6C5CE7] transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Telefon</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} required type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6C5CE7] transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Mesaj</label>
                <textarea value={msg} onChange={e => setMsg(e.target.value)} required rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6C5CE7] transition resize-none" />
              </div>
              <button type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)", boxShadow: "0 4px 14px rgba(108,92,231,.3)" }}>
                Göndər
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-7">
            <h3 className="font-extrabold text-base text-gray-900 mb-4">Əlaqə məlumatları</h3>
            <div className="space-y-4">
              {[
                { icon: "📞", label: "Telefon", value: "+994 XX XXX XX XX" },
                { icon: "📍", label: "Ünvan", value: "Bakı, Azərbaycan" },
                { icon: "📧", label: "Email", value: "info@arzum.az" },
                { icon: "🕐", label: "İş vaxtı", value: "Hər gün 09:00 — 22:00" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: "rgba(108,92,231,.06)" }}>{c.icon}</div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{c.label}</div>
                    <div className="text-sm font-semibold text-gray-700">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map placeholder */}
          <div className="bg-gray-100 rounded-3xl h-48 flex items-center justify-center text-gray-400 text-sm font-semibold">
            🗺 Xəritə tezliklə əlavə olunacaq
          </div>

          {/* Social */}
          <div className="bg-white border border-gray-100 rounded-3xl p-7">
            <h3 className="font-extrabold text-base text-gray-900 mb-4">Bizi izləyin</h3>
            <div className="flex gap-3">
              {["Instagram", "Facebook", "WhatsApp"].map(s => (
                <a key={s} href="#" className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
