import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { fmtMoney, todayStr } from "../../lib/utils";

function currentMonth() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

export default function ExpenseView() {
  const { data, currentUser, toast, addExpenseAndRefresh, deleteExpenseAndRefresh } = useApp();
  const isAdmin = currentUser?.role === "admin";

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(currentMonth());
  const [query, setQuery] = useState("");

  if (!isAdmin) return <div className="py-16 text-center text-gray-400 text-sm">Bu bölməyə giriş icazəniz yoxdur.</div>;

  async function save() {
    const t = title.trim();
    const sum = Number(amount);
    if (!t) { toast("Xərcin adını yazın"); return; }
    if (!sum || sum <= 0) { toast("Məbləği daxil edin"); return; }
    if (!date) { toast("Tarixi seçin"); return; }
    setSaving(true);
    try {
      await addExpenseAndRefresh({ title: t, amount: sum, dateStr: date, note: note.trim(), createdBy: currentUser?.name ?? "" });
      setTitle(""); setAmount(""); setNote(""); setDate(todayStr());
      toast("Xərc qeyd olundu");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Bu xərci silmək istəyirsiniz?")) return;
    await deleteExpenseAndRefresh(id);
    toast("Xərc silindi");
  }

  const list = data.expenses
    .filter(e => !month || (e.dateStr || "").startsWith(month))
    .filter(e => !query.trim() || e.title.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (b.dateStr || "").localeCompare(a.dateStr || "") || b.createdAt - a.createdAt);

  const monthTotal = list.reduce((s, e) => s + Number(e.amount || 0), 0);
  const allTotal = data.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const top = Object.entries(
    list.reduce((acc: Record<string, number>, e) => {
      acc[e.title] = (acc[e.title] || 0) + Number(e.amount || 0);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      {/* Add form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 mb-5">
        <h3 className="font-extrabold mb-3">💸 Yeni xərc əlavə et</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Xərc</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Məs. Mal alışı, İcarə…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18]" />
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
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Qeyd</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="İxtiyari…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18]" />
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="w-full sm:w-auto sm:px-8 mt-3 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-70 cursor-pointer"
          style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
          {saving ? "Gözləyin…" : "+ Əlavə et"}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
          <div className="text-xs text-gray-400 mb-1">Bu ay xərclər</div>
          <div className="text-2xl font-extrabold tabular-nums">{fmtMoney(monthTotal, data.settings.currency)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
          <div className="text-xs text-gray-400 mb-1">Ümumi xərclər</div>
          <div className="text-2xl font-extrabold tabular-nums">{fmtMoney(allTotal, data.settings.currency)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="px-3 py-2 border border-gray-200 bg-white rounded-full text-sm focus:outline-none focus:border-[#FABB18] cursor-pointer" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Xərc adı ilə axtar…"
          className="px-4 py-2 border border-gray-200 bg-white rounded-full text-sm focus:outline-none focus:border-[#FABB18] flex-1 min-w-[160px]" />
        {month && (
          <button onClick={() => setMonth("")}
            className="px-4 py-2 border border-gray-200 bg-white rounded-full text-sm font-bold hover:bg-gray-50 transition cursor-pointer">
            Bütün aylar
          </button>
        )}
      </div>

      {/* Top expenses */}
      {top.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Ən çox xərclər</div>
          <div className="space-y-2">
            {top.map(([t, v]) => (
              <div key={t} className="flex items-center gap-3">
                <div className="text-xs font-bold w-32 sm:w-48 truncate">{t}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: (monthTotal > 0 ? (v / monthTotal) * 100 : 0) + "%", background: "linear-gradient(90deg,#FABB18,#D4A017)" }} />
                </div>
                <div className="text-xs font-extrabold tabular-nums w-20 text-right">{fmtMoney(v, data.settings.currency)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {["Tarix", "Xərc", "Məbləğ", "Qeyd", "Kim", ""].map(h => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wide text-gray-400 font-bold px-4 py-3 border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Xərc tapılmadı.</td></tr>
              ) : list.map(e => (
                <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{e.dateStr}</td>
                  <td className="px-4 py-3 text-sm font-bold">{e.title}</td>
                  <td className="px-4 py-3 text-sm font-extrabold tabular-nums text-red-600">−{fmtMoney(e.amount, data.settings.currency)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-[220px] truncate">{e.note || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{e.createdBy || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => del(e.id)} title="Sil"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition cursor-pointer">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-gray-50">
          {list.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">Xərc tapılmadı.</div>
          ) : list.map(e => (
            <div key={e.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{e.title}</div>
                <div className="text-xs text-gray-400">{e.dateStr}{e.note ? ` · ${e.note}` : ""}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-extrabold text-sm tabular-nums text-red-600">−{fmtMoney(e.amount, data.settings.currency)}</span>
                <button onClick={() => del(e.id)} title="Sil"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 cursor-pointer">🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
