import { useApp } from "../../context/AppContext";
import { fmtMoney, fmtTime, todayStr } from "../../lib/utils";

export default function ReportsView() {
  const { data, reportDate, setReportDate } = useApp();

  const dayHistory = data.history
    .filter(h => h.dateStr === reportDate)
    .sort((a, b) => b.closedAt - a.closedAt);

  const total = dayHistory.reduce((s, h) => s + h.total, 0);
  const count = dayHistory.length;
  const avg = count ? total / count : 0;

  const tableCount = dayHistory.filter(h => !h.isTakeaway).length;
  const takeawayCount = dayHistory.filter(h => h.isTakeaway).length;
  const tableTotal = dayHistory.filter(h => !h.isTakeaway).reduce((s, h) => s + h.total, 0);
  const takeawayTotal = dayHistory.filter(h => h.isTakeaway).reduce((s, h) => s + h.total, 0);

  // Per-item stats
  const itemSales: Record<string, { qty: number; revenue: number }> = {};
  dayHistory.forEach(h => {
    h.items.forEach(li => {
      if (!itemSales[li.name]) itemSales[li.name] = { qty: 0, revenue: 0 };
      itemSales[li.name].qty += li.qty;
      itemSales[li.name].revenue += li.qty * li.price;
    });
  });
  const sortedItemSales = Object.entries(itemSales)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.qty - a.qty);

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 col-span-2 sm:col-span-1">
          <div className="text-xs text-gray-400 mb-2">Ümumi satış</div>
          <div className="text-2xl font-extrabold tabular-nums">{fmtMoney(total, data.settings.currency)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-[#ECE9FE] flex items-center justify-center text-[11px]">🍽</span>
            <span className="text-xs text-gray-400">Masa</span>
          </div>
          <div className="text-2xl font-extrabold tabular-nums">{tableCount}</div>
          <div className="text-xs text-gray-400 mt-1">{fmtMoney(tableTotal, data.settings.currency)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center text-[11px]">📦</span>
            <span className="text-xs text-gray-400">Paket</span>
          </div>
          <div className="text-2xl font-extrabold tabular-nums">{takeawayCount}</div>
          <div className="text-xs text-gray-400 mt-1">{fmtMoney(takeawayTotal, data.settings.currency)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-2">Orta çek</div>
          <div className="text-2xl font-extrabold tabular-nums">{fmtMoney(avg, data.settings.currency)}</div>
        </div>
      </div>

      {/* Date filter */}
      <div className="flex gap-3 items-center mb-5 flex-wrap">
        <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#6C5CE7]" />
        <button onClick={() => setReportDate(todayStr())}
          className="px-4 py-2 border border-gray-200 bg-white rounded-full text-sm font-bold hover:bg-gray-50 transition">
          Bu gün
        </button>
      </div>

      {/* Tables layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-5">
        {/* Daily receipts */}
        <div>
          <h3 className="font-extrabold mb-3">🧾 Günlük Satış Çekləri</h3>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {["Vaxt","Masa/Sifariş","Sifariş","Kassir","Ödəniş","Məbləğ"].map(h => (
                      <th key={h} className="text-left text-[11px] uppercase tracking-wide text-gray-400 font-bold px-4 py-3 border-b border-gray-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayHistory.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Bu tarixdə satış qeydə alınmayıb.</td></tr>
                  ) : dayHistory.map(h => (
                    <tr key={h.id} className={`border-b border-gray-50 last:border-0 transition-colors ${h.isTakeaway ? 'bg-orange-50/40 hover:bg-orange-50/70' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-4 py-3 text-sm text-gray-500">{fmtTime(h.closedAt)}</td>
                      <td className="px-4 py-3 text-sm font-bold">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] flex-shrink-0 ${h.isTakeaway ? 'bg-orange-100' : 'bg-[#ECE9FE]'}`}>
                            {h.isTakeaway ? '📦' : '🍽'}
                          </span>
                          <span className="truncate">{h.tableName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[200px] truncate">{h.items.map(li => li.name + " ×" + li.qty).join(", ")}</td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-500">{h.closedBy}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${h.paymentMethod === "cash" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
                          {h.paymentMethod === "cash" ? "Nağd" : "Kart"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-extrabold text-right tabular-nums">{fmtMoney(h.total, data.settings.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden divide-y divide-gray-50">
              {dayHistory.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">Bu tarixdə satış qeydə alınmayıb.</div>
              ) : dayHistory.map(h => (
                <div key={h.id} className={`px-4 py-3 ${h.isTakeaway ? 'bg-orange-50/40' : ''}`}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] flex-shrink-0 ${h.isTakeaway ? 'bg-orange-100' : 'bg-[#ECE9FE]'}`}>
                        {h.isTakeaway ? '📦' : '🍽'}
                      </span>
                      <span className="font-bold text-sm">{h.tableName}</span>
                    </div>
                    <span className="font-extrabold text-sm tabular-nums">{fmtMoney(h.total, data.settings.currency)}</span>
                  </div>
                  <div className="flex gap-2 items-center text-xs text-gray-400 pl-8 flex-wrap">
                    <span>{fmtTime(h.closedAt)}</span>
                    <span className="text-gray-500 font-bold">👤 {h.closedBy}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${h.paymentMethod === "cash" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
                      {h.paymentMethod === "cash" ? "Nağd" : "Kart"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Per-item stats */}
        <div>
          <h3 className="font-extrabold mb-3">📊 Məhsul üzrə satışlar</h3>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {["Məhsul","Miqdar","Məbləğ"].map(h => (
                    <th key={h} className="text-left text-[11px] uppercase tracking-wide text-gray-400 font-bold px-4 py-3 border-b border-gray-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedItemSales.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">Satış yoxdur.</td></tr>
                ) : sortedItemSales.map(item => (
                  <tr key={item.name} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 text-sm font-bold">{item.name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#5847D1]">{item.qty} ədəd</td>
                    <td className="px-4 py-3 text-sm font-extrabold text-right tabular-nums">{fmtMoney(item.revenue, data.settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
