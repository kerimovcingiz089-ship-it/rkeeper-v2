import { fmtMoney, fmtDateTime } from "../../lib/utils";

export interface ReceiptData {
  restaurantName: string;
  tableName: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  receiptNo: number;
  cashier: string;
  paid: boolean;
  paymentMethod: string | null;
  timestamp: number;
  isTakeaway?: boolean;
  currency: string;
}

export default function Receipt({ data }: { data: ReceiptData }) {
  const { date, time } = fmtDateTime(data.timestamp);
  const itemCount = data.items.reduce((s, li) => s + li.qty, 0);

  return (
    <div className="w-[280px] bg-white text-black font-mono text-[12.5px] leading-snug p-5 mx-auto">
      <div className="text-center font-black text-[15px] uppercase tracking-wide">{data.restaurantName}</div>
      <div className="text-center text-[10.5px] tracking-[2.5px] text-black mt-1 mb-3">
        {data.paid ? "ÖDƏNİŞ QƏBZİ" : "SİFARİŞ ÇEKİ"}
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {[
        ["Tarix", date],
        ["Saat", time],
        [data.isTakeaway ? "Sifariş" : "Masa", data.tableName],
        ["Çek №", "#" + String(data.receiptNo).padStart(5, "0")],
        ["Kassir", data.cashier],
      ].map(([label, value]) => (
        <div key={label} className="flex justify-between py-0.5">
          <span className="text-black font-normal">{label}</span>
          <span className="text-black font-bold">{value}</span>
        </div>
      ))}

      <div className="border-t border-dashed border-black my-2" />

      <div>
        {data.items.length > 0 ? data.items.map((li, idx) => (
          <div key={idx} className="mb-1.5">
            <div className="text-black font-bold">{li.name}</div>
            <div className="flex justify-between text-black">
              <span className="font-normal">{li.qty} × {fmtMoney(li.price, data.currency)}</span>
              <span className="font-bold">{fmtMoney(li.price * li.qty, data.currency)}</span>
            </div>
          </div>
        )) : <div className="text-center text-black text-xs">Məhsul yoxdur</div>}
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <div className="flex justify-between text-xs text-black py-0.5">
        <span className="font-normal">Məhsul sayı</span>
        <span className="font-bold">{itemCount} ədəd</span>
      </div>
      <div className="flex justify-between font-black text-[1.2rem] py-1">
        <span>CƏMİ</span>
        <span>{fmtMoney(data.total, data.currency)}</span>
      </div>

      {data.paid ? (
        <>
          <div className="flex justify-between text-xs py-0.5">
            <span className="text-black font-normal">Ödəniş növü</span>
            <span className="text-black font-bold">{data.paymentMethod === "cash" ? "Nağd" : "Kart"}</span>
          </div>
          <div className="text-center border-2 border-green-600 text-green-600 font-black text-xs tracking-widest rounded py-2 mt-3 -rotate-1">
            ÖDƏNİLİB ✓
          </div>
        </>
      ) : (
        <div className="text-center text-xs text-black italic mt-2">Ödəniş hələ qəbul olunmayıb</div>
      )}

      <div className="border-t border-dashed border-black my-2" />
      <div className="text-center text-xs text-black mt-2">Nuş olsun!<br />Yenidən gözləyirik</div>
    </div>
  );
}
