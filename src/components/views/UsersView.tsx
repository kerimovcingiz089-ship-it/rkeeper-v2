import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { initialsOf } from "../../lib/utils";
import Modal from "../ui/Modal";
import type { Role } from "../../types";

export default function UsersView() {
  const { data, currentUser, toast, refreshUsers, addUserAndRefresh, updateUserAndRefresh, deleteUserAndRefresh } = useApp();
  const isAdmin = currentUser?.role === "admin";

  const [modal, setModal] = useState<
    | { type: "add" }
    | { type: "edit"; id: string }
    | null
  >(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("kassa");
  const [saving, setSaving] = useState(false);

  if (!isAdmin) return <div className="py-16 text-center text-gray-400 text-sm">Bu bölməyə giriş icazəniz yoxdur.</div>;

  function openAdd() { setName(""); setUsername(""); setPassword(""); setRole("kassa"); setModal({ type: "add" }); }
  function openEdit(id: string) {
    const u = data.users.find(x => x.id === id)!;
    setName(u.name); setUsername(u.username); setPassword(""); setRole(u.role);
    setModal({ type: "edit", id });
  }

  async function save() {
    if (!name.trim() || !username.trim()) { toast("Ad və istifadəçi adını doldurun"); return; }
    setSaving(true);
    try {
      if (modal?.type === "add") {
        if (!password) { toast("Şifrə daxil edin"); setSaving(false); return; }
        if (data.users.some(u => u.username.toLowerCase() === username.toLowerCase())) { toast("Bu istifadəçi adı artıq mövcuddur"); setSaving(false); return; }
        const result = await addUserAndRefresh(name.trim(), username.trim(), password, role);
        if (result) {
          await refreshUsers();
          toast("İstifadəçi əlavə olundu");
        } else {
          toast("Əlavə etmək mümkün olmadı");
        }
      } else if (modal?.type === "edit") {
        const uid2 = modal.id;
        const target = data.users.find(u => u.id === uid2)!;
        if (data.users.some(u => u.id !== uid2 && u.username.toLowerCase() === username.toLowerCase())) { toast("Bu istifadəçi adı artıq mövcuddur"); setSaving(false); return; }
        if (target.role === "admin" && role === "kassa" && data.users.filter(u => u.role === "admin" && u.id !== uid2).length === 0) {
          toast("Son admin rolunu dəyişmək olmaz"); setSaving(false); return;
        }
        await updateUserAndRefresh(uid2, { name: name.trim(), username: username.trim(), role, password });
        await refreshUsers();
        toast("Yadda saxlanıldı");
      }
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  async function delUser(id: string) {
    if (id === currentUser?.id) { toast("Öz hesabınızı silə bilməzsiniz"); return; }
    const t = data.users.find(u => u.id === id)!;
    if (t.role === "admin" && data.users.filter(u => u.role === "admin").length <= 1) { toast("Son admin istifadəçini silmək olmaz"); return; }
    if (!confirm("Bu istifadəçini silmək istəyirsiniz?")) return;
    await deleteUserAndRefresh(id);
    await refreshUsers();
    toast("İstifadəçi silindi");
  }

  return (
    <div>
      <div className="flex justify-end mb-5">
        <button onClick={openAdd} className="px-4 py-2 rounded-xl text-white text-sm font-bold cursor-pointer"
          style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>
          + Yeni istifadəçi
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {data.users.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-gray-400">İstifadəçi tapılmadı.</div>
        )}
        {data.users.map(u => {
          const isAdmin2 = u.role === "admin";
          const isSelf = currentUser?.id === u.id;
          return (
            <div key={u.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
                  style={{ background: isAdmin2 ? "linear-gradient(135deg,#6C5CE7,#9C8CFF)" : "linear-gradient(135deg,#12C7B4,#4FE3CD)" }}>
                  {initialsOf(u.name)}
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {u.name}
                    {isSelf && <span className="ml-1.5 text-xs text-gray-400 font-normal">(Siz)</span>}
                  </div>
                  <div className="text-xs text-gray-400">@{u.username}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                  ${isAdmin2 ? "bg-[#ECE9FE] text-[#5847D1]" : "bg-[#DFF7F3] text-[#0E8073]"}`}>
                  {isAdmin2 ? "Admin" : "Kassir"}
                </span>
                <button onClick={() => openEdit(u.id)}
                  className="w-7 h-7 border border-gray-200 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition text-xs cursor-pointer">✎</button>
                <button onClick={() => delUser(u.id)} disabled={isSelf}
                  className="w-7 h-7 border border-gray-200 bg-white rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <Modal onClose={() => setModal(null)}>
          <h3 className="text-lg font-extrabold mb-1">{modal.type === "add" ? "Yeni istifadəçi" : "İstifadəçini redaktə et"}</h3>
          <p className="text-sm text-gray-400 mb-4">Rol təyin edin.</p>
          {[
            { label: "Ad Soyad", value: name, onChange: setName, type: "text", placeholder: "Məs. Əli Vəliyev" },
            { label: "İstifadəçi adı", value: username, onChange: setUsername, type: "text", placeholder: "Məs. eli" },
            { label: modal.type === "edit" ? "Yeni şifrə (boş saxla dəyişmə)" : "Şifrə", value: password, onChange: setPassword, type: "password", placeholder: "••••••" },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-bold text-gray-400 mt-3 mb-1.5">{f.label}</label>
              <input autoFocus={f.label === "Ad Soyad"} type={f.type} value={f.value}
                onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6C5CE7]" />
            </div>
          ))}
          <label className="block text-xs font-bold text-gray-400 mt-3 mb-1.5">Rol</label>
          <select value={role} onChange={e => setRole(e.target.value as Role)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6C5CE7]">
            <option value="kassa">Kassir</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex gap-2 mt-5">
            <button onClick={() => setModal(null)} disabled={saving}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 disabled:opacity-40 cursor-pointer">Ləğv et</button>
            <button onClick={save} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#6C5CE7,#12C7B4)" }}>
              {saving ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Gözləyin...</>) : (modal.type === "add" ? "Əlavə et" : "Yadda saxla")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
