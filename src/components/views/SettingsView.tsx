import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function SettingsView() {
  const { data, setData, currentUser, toast, resetAllDataAndRefresh } = useApp();
  const isAdmin = currentUser?.role === "admin";

  const [name, setName] = useState(data.settings.name);
  const [currency, setCurrency] = useState(data.settings.currency);
  const [resetting, setResetting] = useState(false);

  if (!isAdmin) return <div className="py-16 text-center text-gray-400 text-sm">Bu bölməyə giriş icazəniz yoxdur.</div>;

  function save() {
    setData(prev => ({ ...prev, settings: { name: name.trim() || "Restoran", currency } }));
    toast("Ayarlar yadda saxlanıldı");
  }

  async function resetData() {
    if (!confirm("BÜTÜN məlumatlar silinəcək — məhsullar, stok, satış tarixçəsi, aktiv sifarişlər.\n\nSupabase-dəki products və orders cədvəlləri silinəcək.\nİstifadəçilər saxlanılacaq.\n\nDavam edilsin?")) return;
    setResetting(true);
    try {
      await resetAllDataAndRefresh();
      toast("Məlumatlar sıfırlandı");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="max-w-md">
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <label className="block text-xs font-bold text-gray-400 mb-1.5">Restoran adı</label>
        <input value={name} onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6C5CE7] mb-4" />

        <label className="block text-xs font-bold text-gray-400 mb-1.5">Valyuta işarəsi</label>
        <select value={currency} onChange={e => setCurrency(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6C5CE7] mb-5 cursor-pointer">
          <option value="₼">₼ (Manat)</option>
          <option value="$">$ (Dollar)</option>
          <option value="€">€ (Avro)</option>
          <option value="₽">₽ (Rubl)</option>
        </select>

        <button onClick={save} className="w-full py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer"
          style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>
          Yadda saxla
        </button>

        {/* Danger zone */}
        <div className="mt-6 pt-5 border-t border-red-100">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
            <p className="text-xs text-red-600 font-bold mb-1">Diqqət! Geri qayıtmaz əməliyyat</p>
            <p className="text-xs text-red-400 leading-relaxed">
              Bütün məhsullar, stok, satış tarixçəsi və aktiv sifarişlər silinəcək.
              Yalnız istifadəçilər saxlanılacaq.
            </p>
          </div>
          <button onClick={resetData} disabled={resetting}
            className="w-full py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer">
            {resetting ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Sıfırlanır...</>) : "Bütün məlumatları sıfırla"}
          </button>
        </div>
      </div>
    </div>
  );
}
