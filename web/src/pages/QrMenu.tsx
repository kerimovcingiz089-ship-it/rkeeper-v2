import { useState } from "react";
import { useParams } from "react-router-dom";
import type { Category, Product } from "../lib/api";
import { getCatEmoji } from "../lib/categoryIcons";

interface Props {
  categories: Category[];
  products: Product[];
}

export default function QrMenu({ categories, products }: Props) {
  const { table } = useParams();
  const tableName = table ? decodeURIComponent(table) : "";

  const [activeCat, setActiveCat] = useState<string | null>(categories[0]?.id ?? null);

  function catEmoji(catName: string | undefined) {
    return catName ? getCatEmoji(catName) : "🍽️";
  }

  const filtered = activeCat ? products.filter(p => p.categoryId === activeCat) : products;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#FFFBF5,#FFF1F2)" }}>
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
              style={{ background: "linear-gradient(135deg,#F43F5E,#F59E0B)" }}>
              <img src="/logo.png" alt="Arzum Şirniyyat" className="w-full h-full object-contain" />
            </div>
            <div className="font-display font-bold text-gray-900 tracking-tight leading-none">
              Arzum <span className="text-rose-500">Şirniyyat</span>
            </div>
          </div>
          {tableName && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-3 py-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
              {tableName}
            </span>
          )}
        </div>
      </header>

      {/* ── Welcome strip ── */}
      <div className="max-w-md mx-auto px-4 pt-6 pb-3 text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-rose-400 block mb-2">Menyumuz</span>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">
          {tableName ? `Xoş gəlmisiniz, ${tableName}` : "Arzum Şirniyyat"}
        </h1>
        <p className="text-sm text-gray-400">Şirin dadların ünvanı</p>
      </div>

      {/* ── Category pills (sticky) ── */}
      <div className="sticky top-14 z-30 pt-3 pb-2" style={{ background: "linear-gradient(180deg,#FFFBF5 85%,transparent)" }}>
        <div className="max-w-md mx-auto px-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={`px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                activeCat === c.id
                  ? "text-white border-transparent shadow-lg"
                  : "text-gray-500 bg-white border-gray-100 hover:border-rose-200 hover:text-rose-500"
              }`}
              style={activeCat === c.id ? { background: "linear-gradient(135deg,#F43F5E,#E11D48)", boxShadow: "0 4px 16px rgba(244,63,94,.3)" } : {}}>
              {catEmoji(c.name)} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product rows ── */}
      <div className="max-w-md mx-auto px-4 pb-16 pt-2 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-sm text-gray-400">Bu kateqoriyada məhsul yoxdur</p>
          </div>
        )}
        {filtered.map(p => {
          const catName = categories.find(c => c.id === p.categoryId)?.name;
          const out = p.stock <= 0;
          return (
            <div key={p.id} className={`bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3 ${out ? "opacity-60" : ""}`}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                style={{ background: `linear-gradient(135deg,hsl(${(parseInt(p.id) * 37 + 340) % 360},85%,96%),hsl(${(parseInt(p.id) * 37 + 20) % 360},75%,94%))` }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl">{catEmoji(catName)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-gray-900">{p.name}</h3>
                <div className="text-[11px] text-gray-400 mt-0.5">{catEmoji(catName)} {catName}</div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-display text-base font-bold text-rose-500">₼{p.price.toFixed(2)}</div>
                {out && (
                  <div className="text-[10px] font-bold text-gray-400 bg-gray-50 rounded-full px-2 py-0.5 mt-1">Stok yoxdur</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
