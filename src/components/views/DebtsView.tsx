import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { fmtMoney, todayStr } from "../../lib/utils";
import Modal from "../ui/Modal";
import type { Debt, DebtKind } from "../../types";

function paidSum(d: Debt): number {
  return d.payments.reduce((s, p) => s + Number(p.amount || 0), 0);
}

function remaining(d: Debt): number {
  return Math.max(0, Number(d.totalAmount || 0) - paidSum(d));
}

export default function DebtsView() {
  const { data, currentUser, toast, addDebtAndRefresh, addDebtPaymentAndRefresh, deleteDebtAndRefresh } = useApp();
  const isAdmin = currentUser?.role === "admin";

  const [tab, setTab] = useState<DebtKind>("given");
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [showClosed, setShowClosed] = useState(false);
  const [payModal, setPayModal] = useState<{ id: string } | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(todayStr());
  const [payNote, setPayNote] = useState("");
  const [paySaving, setPaySaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!isAdmin) return <div className="py-16 text-center text-gray-400 text-sm">Bu bölməyə giriş icazəniz yoxdur.</div>;

  async function saveDebt() {
    const sum = Number(amount);
    if (!personName.trim()) { toast("Adı daxil edin"); return; }
    if (!sum || sum <= 0) { toast("Məbləği daxil edin"); return; }
    if (!date) { toast("Tarixi seçin"); return; }
    setSaving(true);
    try {
      await addDebtAndRefresh({ personName: personName.trim(), kind: tab, totalAmount: sum, dateStr: date, note: note.trim() });
      setPersonName(""); setAmount(""); setNote(""); setDate(todayStr());
      toast(tab === "given" ? "Nisyə (alacaq) qeyd olundu" : "Nisyə (borc) qeyd olundu");
    } finally {
      setSaving(false);
    }
  }

  async function savePayment() {
    if (!payModal) return;
    const debt = data.debts.find(d => String(d.id) === String(payModal.id));
    if (!debt) return;
    const sum = Number(payAmount);
    if (!sum || sum <= 0) { toast("Məbləği daxil edin"); return; }
    if (sum > remaining(debt) + 0.001) { toast("Məbləğ qalıqdan çox ola bilməz"); return; }
    setPaySaving(true);
    try {
      await addDebtPaymentAndRefresh(payModal.id, { amount: sum, dateStr: payDate || todayStr(), note: payNote.trim() });
      setPayModal(null); setPayAmount(""); setPayNote(""); setPayDate(todayStr());
      toast("Ödəniş qeyd olundu");
    } finally {
      setPaySaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Bu borc yazısını silmək istəyirsiniz?")) return;
    await deleteDebtAndRefresh(id);
    toast("Yazı silindi");
  }

  const list = data.debts
    .filter(d => d.kind === tab)
    .filter(d => !query.trim() || d.personName.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (remaining(a) <= 0 ? 1 : 0) - (remaining(b) <= 0 ? 1 : 0) || b.createdAt - a.createdAt);

  const visible = showClosed ? list : list.filter(d => remaining(d) > 0);
  const openTotal = data.debts.filter(d => d.kind === tab).reduce((s, d) => s + remaining(d), 0);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["given", "taken"] as DebtKind[]).map(k => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer
              ${tab === k ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-500 hover:border-[#FABB18]"}`}
            style={tab === k ? { background: "linear-gradient(135deg,#FABB18,#D4A017)" } : {}}>
            {k === "given" ? "📤 Alacaqlarım (verilən nisyə)" : "📥 Borclarım (alınan nisyə)"}
          </button>
        ))}
      </div>

      {/* Open total */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {tab === "given" ? "Məndən alacaqlar (açıq qalıq)" : "Mənim borclarım (açıq qalıq)"}
        </span>
        <span className="text-2xl font-extrabold tabular-nums">{fmtMoney(openTotal, data.settings.currency)}</span>
      </div>

      {/* Add form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 mb-5">
        <h3 className="font-extrabold mb-3">{tab === "given" ? "+ Yeni nisyə ver (alacaq)" : "+ Yeni nisyə al (borc)"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Ad</label>
            <input value={personName} onChange={e => setPersonName(e.target.value)} placeholder="Məs. Əli Vəliyev"
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
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Əlavə qeyd…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18]" />
          </div>
          <div className="flex items-end">
            <button onClick={saveDebt} disabled={saving}
              className="w-full py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-70 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
              {saving ? "Gözləyin…" : "+ Əlavə et"}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ad ilə axtar…"
          className="px-4 py-2 border border-gray-200 bg-white rounded-full text-sm focus:outline-none focus:border-[#FABB18] flex-1 min-w-[160px]" />
        <label className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-full px-4 py-2 cursor-pointer">
          <input type="checkbox" checked={showClosed} onChange={e => setShowClosed(e.target.checked)} className="cursor-pointer" />
          Bağlıları göstər
        </label>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {visible.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">Yazı tapılmadı.</div>
        ) : visible.map(d => {
          const paid = paidSum(d);
          const left = remaining(d);
          const closed = left <= 0;
          const pct = d.totalAmount > 0 ? Math.min(100, Math.round((paid / d.totalAmount) * 100)) : 100;
          const isOpen = expanded === String(d.id);
          return (
            <div key={d.id} className="px-4 md:px-5 py-4 border-b border-gray-50 last:border-0">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{d.personName}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${closed ? "bg-green-50 text-green-600" : "bg-[#FEF3C7] text-[#8B6914]"}`}>
                      {closed ? "Bağlı" : "Açıq"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {d.dateStr}{d.note ? ` · ${d.note}` : ""} · Cəmi {fmtMoney(d.totalAmount, data.settings.currency)} · Ödənilib {fmtMoney(paid, data.settings.currency)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right mr-1">
                    <div className="text-[11px] text-gray-400">Qalıq</div>
                    <div className={`font-extrabold text-sm tabular-nums ${closed ? "text-green-600" : ""}`}>{fmtMoney(left, data.settings.currency)}</div>
                  </div>
                  {!closed && (
                    <button onClick={() => { setPayModal({ id: String(d.id) }); setPayAmount(""); setPayNote(""); setPayDate(todayStr()); }}
                      className="px-3 py-2 rounded-xl text-white text-xs font-bold cursor-pointer"
                      style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
                      Ödəniş
                    </button>
                  )}
                  <button onClick={() => setExpanded(isOpen ? null : String(d.id))}
                    className="w-8 h-8 border border-gray-200 rounded-lg text-gray-400 text-xs hover:bg-gray-50 cursor-pointer">
                    {isOpen ? "▲" : "▼"}
                  </button>
                  <button onClick={() => del(d.id)} title="Sil"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition cursor-pointer">🗑</button>
                </div>
              </div>
              {/* Progress */}
              <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className={`h-full rounded-full ${closed ? "bg-green-500" : ""}`}
                  style={{ width: pct + "%", background: closed ? undefined : "linear-gradient(90deg,#FABB18,#D4A017)" }} />
              </div>
              {/* Payments detail */}
              {isOpen && (
                <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2">
                  {d.payments.length === 0 ? (
                    <div className="text-xs text-gray-400 py-1">Hələ ödəniş yoxdur.</div>
                  ) : [...d.payments].reverse().map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0 text-xs">
                      <span className="text-gray-500">{p.dateStr}{p.note ? ` · ${p.note}` : ""}</span>
                      <span className="font-bold tabular-nums">−{fmtMoney(p.amount, data.settings.currency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment modal */}
      {payModal && (
        <Modal onClose={() => setPayModal(null)}>
          <h3 className="text-lg font-extrabold mb-1">Ödəniş əlavə et</h3>
          <p className="text-sm text-gray-400 mb-4">
            Qalıq: {fmtMoney(remaining(data.debts.find(d => String(d.id) === payModal.id)!), data.settings.currency)}
          </p>
          <label className="block text-xs font-bold text-gray-400 mb-1.5">Məbləğ ({data.settings.currency})</label>
          <input autoFocus type="number" min="0" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18]" />
          <label className="block text-xs font-bold text-gray-400 mt-3 mb-1.5">Tarix</label>
          <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18] cursor-pointer" />
          <label className="block text-xs font-bold text-gray-400 mt-3 mb-1.5">Qeyd</label>
          <input value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="Əlavə qeyd…"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18]" />
          <div className="flex gap-2 mt-5">
            <button onClick={() => setPayModal(null)} disabled={paySaving}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 disabled:opacity-40 cursor-pointer">Ləğv et</button>
            <button onClick={savePayment} disabled={paySaving}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-70 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
              {paySaving ? "Gözləyin…" : "Yadda saxla"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
