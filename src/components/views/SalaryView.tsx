import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { fmtMoney, todayStr } from "../../lib/utils";

function currentMonth() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

export default function SalaryView() {
  const { data, currentUser, toast, addSalaryAndRefresh, deleteSalaryAndRefresh } = useApp();
  const isAdmin = currentUser?.role === "admin";

  const [employeeName, setEmployeeName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(currentMonth());
  const [query, setQuery] = useState("");

  if (!isAdmin) return <div className="py-16 text-center text-gray-400 text-sm">Bu bölməyə giriş icazəniz yoxdur.</div>;

  async function save() {
    const name = employeeName.trim();
    const sum = Number(amount);
    if (!name) { toast("İşçinin adını yazın"); return; }
    if (!sum || sum <= 0) { toast("Məbləği daxil edin"); return; }
    if (!date) { toast("Tarixi seçin"); return; }
    setSaving(true);
    try {
      const matched = data.users.find(u => u.name.toLowerCase() === name.toLowerCase());
      await addSalaryAndRefresh({
        userId: matched?.id ?? "",
        employeeName: name,
        amount: sum,
        dateStr: date,
        note: note.trim(),
        paidBy: currentUser?.name ?? "",
      });
      setEmployeeName(""); setAmount(""); setNote(""); setDate(todayStr());
      toast("Maaş qeyd olundu");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Bu maaş yazısını silmək istəyirsiniz?")) return;
    await deleteSalaryAndRefresh(id);
    toast("Yazı silindi");
  }

  const monthList = data.salaries
    .filter(s => !month || s.dateStr.startsWith(month))
    .filter(s => !query.trim() || s.employeeName.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (b.dateStr || "").localeCompare(a.dateStr || "") || b.createdAt - a.createdAt);

  const monthTotal = monthList.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      {/* Add form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 mb-5">
        <h3 className="font-extrabold mb-3">💰 Maaş ödənişi əlavə et</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-1">
            <label className="block text-xs font-bold text-gray-400 mb-1.5">İşçi</label>
            <input value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Məs. Əli Vəliyev" list="salary-employees"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18]" />
            <datalist id="salary-employees">
              {data.users.map(u => (
                <option key={u.id} value={u.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Məbləğ ({data.settings.currency})</label>
            <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Tarix</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18] cursor-pointer" />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Qeyd</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Məs. gündəlik, avans…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18]" />
          </div>
          <div className="flex items-end">
            <button onClick={save} disabled={saving}
              className="w-full py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-70 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
              {saving ? "Gözləyin…" : "+ Əlavə et"}
            </button>
          </div>
        </div>
      </div>

      {/* Filters + total */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="px-3 py-2 border border-gray-200 bg-white rounded-full text-sm focus:outline-none focus:border-[#FABB18] cursor-pointer" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="İşçi adı ilə axtar…"
          className="px-4 py-2 border border-gray-200 bg-white rounded-full text-sm focus:outline-none focus:border-[#FABB18] flex-1 min-w-[160px]" />
        <div className="ml-auto bg-white border border-gray-200 rounded-full px-4 py-2 text-sm">
          <span className="text-gray-400">Cəmi: </span>
          <span className="font-extrabold tabular-nums">{fmtMoney(monthTotal, data.settings.currency)}</span>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {["Tarix", "İşçi", "Məbləğ", "Qeyd", "Kim verdi", ""].map(h => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wide text-gray-400 font-bold px-4 py-3 border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthList.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Yazı tapılmadı.</td></tr>
              ) : monthList.map(s => (
                <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{s.dateStr}</td>
                  <td className="px-4 py-3 text-sm font-bold">{s.employeeName}</td>
                  <td className="px-4 py-3 text-sm font-extrabold tabular-nums">{fmtMoney(s.amount, data.settings.currency)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-[220px] truncate">{s.note || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.paidBy || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => del(s.id)} title="Sil"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition cursor-pointer">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-gray-50">
          {monthList.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">Yazı tapılmadı.</div>
          ) : monthList.map(s => (
            <div key={s.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{s.employeeName}</div>
                <div className="text-xs text-gray-400">{s.dateStr}{s.note ? ` · ${s.note}` : ""}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-extrabold text-sm tabular-nums">{fmtMoney(s.amount, data.settings.currency)}</span>
                <button onClick={() => del(s.id)} title="Sil"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 cursor-pointer">🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
