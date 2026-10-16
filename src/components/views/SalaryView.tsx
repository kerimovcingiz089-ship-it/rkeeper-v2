import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { fmtMoney, todayStr, initialsOf } from "../../lib/utils";
import Modal from "../ui/Modal";

function currentMonth() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

export default function SalaryView() {
  const {
    data, currentUser, toast,
    addSalaryEmployeeAndRefresh, deleteSalaryEmployeeAndRefresh,
    addSalaryAndRefresh, deleteSalaryAndRefresh,
  } = useApp();
  const isAdmin = currentUser?.role === "admin";

  const [empName, setEmpName] = useState("");
  const [empNote, setEmpNote] = useState("");
  const [empSaving, setEmpSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [payModal, setPayModal] = useState<{ employeeId: string; employeeName: string } | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");
  const [paySaving, setPaySaving] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);

  if (!isAdmin) return <div className="py-16 text-center text-gray-400 text-sm">Bu bölməyə giriş icazəniz yoxdur.</div>;

  const month = currentMonth();

  function empTotal(id: string): number {
    return data.salaries.filter(s => String(s.employeeId) === String(id)).reduce((s, r) => s + Number(r.amount || 0), 0);
  }

  function empMonthTotal(id: string): number {
    return data.salaries
      .filter(s => String(s.employeeId) === String(id) && (s.dateStr || "").startsWith(month))
      .reduce((s, r) => s + Number(r.amount || 0), 0);
  }

  async function saveEmployee() {
    const name = empName.trim();
    if (!name) { toast("İşçinin adını yazın"); return; }
    if (data.salaryEmployees.some(e => e.name.toLowerCase() === name.toLowerCase())) { toast("Bu işçi artıq əlavə olunub"); return; }
    setEmpSaving(true);
    try {
      await addSalaryEmployeeAndRefresh(name, empNote.trim());
      setEmpName(""); setEmpNote("");
      toast("İşçi əlavə olundu");
    } finally {
      setEmpSaving(false);
    }
  }

  async function savePayment() {
    if (!payModal) return;
    const sum = Number(amount);
    if (!sum || sum <= 0) { toast("Məbləği daxil edin"); return; }
    if (!date) { toast("Tarixi seçin"); return; }
    setPaySaving(true);
    try {
      await addSalaryAndRefresh({
        employeeId: payModal.employeeId,
        userId: "",
        employeeName: payModal.employeeName,
        amount: sum,
        dateStr: date,
        note: note.trim(),
        paidBy: currentUser?.name ?? "",
      });
      setPayModal(null); setAmount(""); setNote(""); setDate(todayStr());
      toast("Maaş ödənildi");
    } finally {
      setPaySaving(false);
    }
  }

  async function delEmployee(id: string, name: string) {
    if (!confirm(`"${name}" işçisini silmək istəyirsiniz? Ödəniş yazıları qalacaq.`)) return;
    await deleteSalaryEmployeeAndRefresh(id);
    toast("İşçi silindi");
  }

  async function delPayment(id: string) {
    if (!confirm("Bu maaş yazısını silmək istəyirsiniz?")) return;
    await deleteSalaryAndRefresh(id);
    toast("Yazı silindi");
  }

  const employees = data.salaryEmployees
    .filter(e => !query.trim() || e.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const archive = data.salaries
    .filter(s => !s.employeeId)
    .sort((a, b) => (b.dateStr || "").localeCompare(a.dateStr || "") || b.createdAt - a.createdAt);

  const reportEmp = reportId ? data.salaryEmployees.find(e => String(e.id) === String(reportId)) : undefined;
  const reportPayments = reportId
    ? data.salaries.filter(s => String(s.employeeId) === String(reportId))
        .sort((a, b) => (b.dateStr || "").localeCompare(a.dateStr || "") || b.createdAt - a.createdAt)
    : [];
  const reportTotal = reportPayments.reduce((s, r) => s + Number(r.amount || 0), 0);
  const reportMonthTotal = reportPayments.filter(r => (r.dateStr || "").startsWith(month)).reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <div>
      {/* Add employee */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 mb-5">
        <h3 className="font-extrabold mb-3">👷 Yeni işçi əlavə et</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Ad Soyad</label>
            <input value={empName} onChange={e => setEmpName(e.target.value)} placeholder="Məs. Əli Vəliyev"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Qeyd (ixtiyari)</label>
            <input value={empNote} onChange={e => setEmpNote(e.target.value)} placeholder="Məs. aşpaz…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18]" />
          </div>
          <div className="flex items-end">
            <button onClick={saveEmployee} disabled={empSaving}
              className="w-full py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-70 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
              {empSaving ? "Gözləyin…" : "+ Əlavə et"}
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="İşçi adı ilə axtar…"
          className="w-full sm:w-80 px-4 py-2 border border-gray-200 bg-white rounded-full text-sm focus:outline-none focus:border-[#FABB18]" />
      </div>

      {/* Employee cards */}
      {employees.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-10 text-center text-sm text-gray-400">
          Hələ işçi əlavə olunmayıb. Yuxarıdan ilk işçini qeyd edin.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {employees.map(e => (
            <div key={e.id} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
                  {initialsOf(e.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <button onClick={() => setReportId(String(e.id))}
                    className="font-bold text-sm truncate hover:text-[#D4A017] transition cursor-pointer text-left">
                    {e.name}
                  </button>
                  <div className="text-xs text-gray-400 truncate">{e.note || "—"}</div>
                </div>
                <button onClick={() => delEmployee(e.id, e.name)} title="İşçini sil"
                  className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition text-xs flex-shrink-0 cursor-pointer">🗑</button>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-0.5">
                <span>Bu ay: <b className="text-gray-700 tabular-nums">{fmtMoney(empMonthTotal(e.id), data.settings.currency)}</b></span>
                <span>Cəmi: <b className="text-gray-700 tabular-nums">{fmtMoney(empTotal(e.id), data.settings.currency)}</b></span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setPayModal({ employeeId: String(e.id), employeeName: e.name }); setAmount(""); setNote(""); setDate(todayStr()); }}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold cursor-pointer"
                  style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
                  💰 Maaş ver
                </button>
                <button onClick={() => setReportId(String(e.id))}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 cursor-pointer">
                  📊 Hesabat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Archive */}
      {archive.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-5">
          <button onClick={() => setShowArchive(!showArchive)}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-bold text-gray-500 hover:bg-gray-50 cursor-pointer">
            <span>🗂 Arxiv — köhnə yazılar ({archive.length})</span>
            <span className="text-xs">{showArchive ? "▲" : "▼"}</span>
          </button>
          {showArchive && (
            <div className="divide-y divide-gray-50 border-t border-gray-100">
              {archive.map(s => (
                <div key={s.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 text-xs">
                    <span className="font-bold text-sm">{s.employeeName}</span>
                    <span className="text-gray-400"> · {s.dateStr}{s.note ? ` · ${s.note}` : ""}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-extrabold text-sm tabular-nums">{fmtMoney(s.amount, data.settings.currency)}</span>
                    <button onClick={() => delPayment(s.id)} title="Sil"
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-500 text-xs cursor-pointer">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pay modal */}
      {payModal && (
        <Modal onClose={() => setPayModal(null)}>
          <h3 className="text-lg font-extrabold mb-1">Maaş ver — {payModal.employeeName}</h3>
          <p className="text-sm text-gray-400 mb-4">Adı yenidən yazmağa ehtiyac yoxdur.</p>
          <label className="block text-xs font-bold text-gray-400 mb-1.5">Məbləğ ({data.settings.currency})</label>
          <input autoFocus type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18]" />
          <label className="block text-xs font-bold text-gray-400 mt-3 mb-1.5">Tarix</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18] cursor-pointer" />
          <label className="block text-xs font-bold text-gray-400 mt-3 mb-1.5">Qeyd</label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Məs. gündəlik, avans…"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18]" />
          <div className="flex gap-2 mt-5">
            <button onClick={() => setPayModal(null)} disabled={paySaving}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 disabled:opacity-40 cursor-pointer">Ləğv et</button>
            <button onClick={savePayment} disabled={paySaving}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-70 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
              {paySaving ? "Gözləyin…" : "Ödə"}
            </button>
          </div>
        </Modal>
      )}

      {/* Report modal */}
      {reportEmp && (
        <Modal onClose={() => setReportId(null)}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-extrabold flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
              {initialsOf(reportEmp.name)}
            </div>
            <div>
              <h3 className="text-lg font-extrabold">{reportEmp.name}</h3>
              <p className="text-sm text-gray-400">{reportEmp.note || "Maaş hesabatı"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 my-4">
            <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
              <div className="text-[11px] text-gray-400">Bu ay</div>
              <div className="font-extrabold tabular-nums">{fmtMoney(reportMonthTotal, data.settings.currency)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
              <div className="text-[11px] text-gray-400">Cəmi</div>
              <div className="font-extrabold tabular-nums">{fmtMoney(reportTotal, data.settings.currency)}</div>
            </div>
          </div>
          <div className="max-h-64 overflow-auto divide-y divide-gray-50 border-t border-b border-gray-100">
            {reportPayments.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">Hələ ödəniş yoxdur.</div>
            ) : reportPayments.map(p => (
              <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0 text-xs">
                  <div className="font-bold text-sm tabular-nums">{fmtMoney(p.amount, data.settings.currency)}</div>
                  <div className="text-gray-400">{p.dateStr}{p.note ? ` · ${p.note}` : ""}{p.paidBy ? ` · ${p.paidBy}` : ""}</div>
                </div>
                <button onClick={() => delPayment(p.id)} title="Sil"
                  className="w-8 h-8 rounded-lg bg-red-50 text-red-500 text-xs flex-shrink-0 cursor-pointer">🗑</button>
              </div>
            ))}
          </div>
          <button onClick={() => setReportId(null)}
            className="w-full mt-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 cursor-pointer">Bağla</button>
        </Modal>
      )}
    </div>
  );
}
