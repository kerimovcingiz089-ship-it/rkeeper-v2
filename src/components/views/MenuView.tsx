import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { fmtMoney } from "../../lib/utils";
import Modal from "../ui/Modal";
import { addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory } from "../../lib/supabaseApi";

export default function MenuView() {
  const { data, setData, currentUser, toast, refreshProducts, refreshCategories } = useApp();
  const isAdmin = currentUser?.role === "admin";

  const [modal, setModal] = useState<
    | { type: "addCat" }
    | { type: "editCat"; id: string }
    | { type: "addItem"; catId: string }
    | { type: "editItem"; id: string }
    | null
  >(null);

  const [catName, setCatName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCatId, setItemCatId] = useState("");

  if (!isAdmin) {
    return <div className="py-16 text-center text-gray-400 text-sm">Bu bölməyə giriş icazəniz yoxdur.</div>;
  }

  function openAddCat() { setCatName(""); setModal({ type: "addCat" }); }
  function openEditCat(id: string) {
    const cat = data.categories.find(c => c.id === id)!;
    setCatName(cat.name);
    setModal({ type: "editCat", id });
  }
  function openAddItem(catId: string) { setItemName(""); setItemPrice(""); setItemCatId(catId); setModal({ type: "addItem", catId }); }
  function openEditItem(id: string) {
    const item = data.items.find(i => i.id === id)!;
    setItemName(item.name); setItemPrice(String(item.price)); setItemCatId(item.categoryId);
    setModal({ type: "editItem", id });
  }

  async function saveCat() {
    if (!catName.trim()) { toast("Ad daxil edin"); return; }
    if (modal?.type === "addCat") {
      const result = await addCategory(catName.trim());
      if (result) {
        await refreshCategories();
        toast("Kateqoriya əlavə edildi");
      } else {
        toast("Əlavə etmək mümkün olmadı");
      }
    } else if (modal?.type === "editCat") {
      await updateCategory(modal.id, catName.trim());
      await refreshCategories();
      toast("Kateqoriya yeniləndi");
    }
    setModal(null);
  }

  async function saveItem() {
    const price = parseFloat(itemPrice);
    if (!itemName.trim() || isNaN(price) || price < 0) { toast("Düzgün ad və qiymət daxil edin"); return; }
    if (modal?.type === "addItem") {
      setModal(null);
      const newItem = { id: uid("i"), name: itemName.trim(), price, categoryId: itemCatId, stock: 0 };
      setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
      await addProduct(itemName.trim(), price, itemCatId);
      await refreshProducts();
      toast("Məhsul əlavə edildi");
    } else if (modal?.type === "editItem") {
      const id = (modal as any).id;
      setModal(null);
      setData(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? { ...i, name: itemName.trim(), price, categoryId: itemCatId } : i) }));
      await updateProduct(id, itemName.trim(), price, itemCatId);
      await refreshProducts();
      toast("Məhsul yeniləndi");
    }
  }

  async function delItem(id: string) {
    if (!confirm("Bu yeməyi silmək istəyirsiniz?")) return;
    setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
    await deleteProduct(id);
    toast("Məhsul silindi");
  }

  async function delCat(id: string) {
    if (data.items.some(i => i.categoryId === id)) { toast("Əvvəlcə bu kateqoriyadakı yeməkləri silin"); return; }
    if (!confirm("Kateqoriyanı silmək istəyirsiniz?")) return;
    await deleteCategory(id);
    await refreshCategories();
    toast("Kateqoriya silindi");
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-end mb-5">
        <button onClick={openAddCat}
          className="px-4 py-2 rounded-xl text-white text-sm font-bold"
          style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>
          + Yeni kateqoriya
        </button>
      </div>

      {/* Category blocks */}
      <div className="space-y-4">
        {data.categories.map(cat => {
          const items = data.items.filter(i => i.categoryId === cat.id);
          return (
            <div key={cat.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex justify-between items-center px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                <h3 className="font-extrabold text-sm">{cat.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => openAddItem(cat.id)}
                    className="px-3 py-1.5 border border-gray-200 bg-white text-xs font-bold rounded-lg hover:bg-gray-50 transition">+ Yemək</button>
                  <button onClick={() => openEditCat(cat.id)}
                    className="w-7 h-7 border border-gray-200 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition">✎</button>
                  <button onClick={() => delCat(cat.id)}
                    className="w-7 h-7 border border-gray-200 bg-white rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition">✕</button>
                </div>
              </div>
              {items.length === 0 ? (
                <div className="px-5 py-4 text-sm text-gray-400">Bu kateqoriyada yemək yoxdur.</div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex justify-between items-center px-5 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">{item.name}</span>
                      <span className="text-sm text-gray-400">{fmtMoney(item.price, data.settings.currency)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${item.stock <= 0 ? "bg-red-50 text-red-400" : "bg-green-50 text-green-600"}`}>
                        Stok: {item.stock}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEditItem(item.id)}
                        className="w-7 h-7 border border-gray-200 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition">✎</button>
                      <button onClick={() => delItem(item.id)}
                        className="w-7 h-7 border border-gray-200 bg-white rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition">✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      {/* ── Category Modal ── */}
      {(modal?.type === "addCat" || modal?.type === "editCat") && (
        <Modal onClose={() => setModal(null)}>
          <h3 className="text-lg font-extrabold mb-1">{modal.type === "addCat" ? "Yeni kateqoriya" : "Kateqoriyanı redaktə et"}</h3>
          <label className="block text-xs font-bold text-gray-400 mt-4 mb-1.5">Kateqoriya adı</label>
          <input autoFocus value={catName} onChange={e => setCatName(e.target.value)}
            placeholder="Məs. Şorbalar"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6C5CE7]" />
          <div className="flex gap-2 mt-5">
            <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50">Ləğv et</button>
            <button onClick={saveCat} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>
              {modal.type === "addCat" ? "Əlavə et" : "Yadda saxla"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Item Modal ── */}
      {(modal?.type === "addItem" || modal?.type === "editItem") && (
        <Modal onClose={() => setModal(null)}>
          <h3 className="text-lg font-extrabold mb-1">{modal.type === "addItem" ? "Yeni yemək" : "Yeməyi redaktə et"}</h3>
          <label className="block text-xs font-bold text-gray-400 mt-4 mb-1.5">Yemək adı</label>
          <input autoFocus value={itemName} onChange={e => setItemName(e.target.value)}
            placeholder="Məs. Mərcimək Şorbası"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6C5CE7]" />
          <label className="block text-xs font-bold text-gray-400 mt-3 mb-1.5">Qiymət</label>
          <input type="number" value={itemPrice} onChange={e => setItemPrice(e.target.value)}
            placeholder="0.00" min={0} step={0.01}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6C5CE7]" />
          {modal.type === "editItem" && (
            <>
              <label className="block text-xs font-bold text-gray-400 mt-3 mb-1.5">Kateqoriya</label>
              <select value={itemCatId} onChange={e => setItemCatId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6C5CE7]">
                {data.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </>
          )}
          <div className="flex gap-2 mt-5">
            <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50">Ləğv et</button>
            <button onClick={saveItem} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>
              {modal.type === "addItem" ? "Əlavə et" : "Yadda saxla"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
