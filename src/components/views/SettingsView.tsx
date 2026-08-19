import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { LANGUAGES } from "../../lib/translations";

const CURRENT_VERSION = "2.1.1";
const GITHUB_REPO = "kerimovcingiz089-ship-it/rkeeper-v2";

interface ReleaseInfo {
  tag_name: string;
  name: string;
  assets: { name: string; browser_download_url: string; size: number }[];
}

async function checkGitHubRelease(): Promise<ReleaseInfo | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function isNewer(a: string, b: string): boolean {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return true;
    if ((pa[i] || 0) < (pb[i] || 0)) return false;
  }
  return false;
}

export default function SettingsView() {
  const { data, setData, currentUser, toast, resetAllDataAndRefresh, lang, setLang, t } = useApp();
  const isAdmin = currentUser?.role === "admin";

  const [name, setName] = useState(data.settings.name);
  const [currency, setCurrency] = useState(data.settings.currency);
  const [resetting, setResetting] = useState(false);

  const [updateStatus, setUpdateStatus] = useState<"checking" | "latest" | "available" | "downloading" | "ready" | "error">("checking");
  const [newVersion, setNewVersion] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      const release = await checkGitHubRelease();
      if (!release) { setUpdateStatus("latest"); return; }
      const remoteVer = release.tag_name.replace(/^v/, "");
      if (isNewer(remoteVer, CURRENT_VERSION)) {
        setNewVersion(remoteVer);
        setUpdateStatus("available");
      } else {
        setUpdateStatus("latest");
      }
    })();
  }, []);

  async function handleUpdate() {
    const release = await checkGitHubRelease();
    if (!release?.assets?.[0]) { setErrorMsg("Yükləmə faylı tapılmadı"); setUpdateStatus("error"); return; }
    const url = release.assets[0].browser_download_url;
    setUpdateStatus("downloading");
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const path = await invoke("download_update", { url }) as string;
      setUpdateStatus("ready");
      await invoke("install_update", { path });
    } catch (err: any) {
      setErrorMsg(String(err));
      setUpdateStatus("error");
    }
  }

  if (!isAdmin) return <div className="py-16 text-center text-gray-400 text-sm">{t("settings.noAccess")}</div>;

  function save() {
    setData(prev => ({ ...prev, settings: { name: name.trim() || "Restoran", currency } }));
    toast(t("settings.saved"));
  }

  async function resetData() {
    if (!confirm(t("settings.resetConfirm"))) return;
    setResetting(true);
    try {
      await resetAllDataAndRefresh();
      toast(t("settings.resetDone"));
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      {/* Update */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-extrabold text-gray-900">Yeniləmə</p>
            <p className="text-xs text-gray-400 mt-0.5">Cari versiya: {CURRENT_VERSION}</p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
            style={{ background: "linear-gradient(135deg,rgba(250,187,24,.12),rgba(212,160,23,.08))" }}>
            {updateStatus === "checking" && <span className="w-4 h-4 border-2 border-[#FABB18] border-t-transparent rounded-full animate-spin" />}
            {updateStatus === "latest" && "✓"}
            {updateStatus === "available" && <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />}
            {(updateStatus === "downloading" || updateStatus === "ready") && <span className="w-4 h-4 border-2 border-[#FABB18] border-t-transparent rounded-full animate-spin" />}
            {updateStatus === "error" && "✕"}
          </div>
        </div>

        {updateStatus === "checking" && (
          <p className="text-xs text-gray-400">Yeniliklər yoxlanılır...</p>
        )}
        {updateStatus === "latest" && (
          <p className="text-xs text-green-600 font-bold">Proqram yenidir ({CURRENT_VERSION})</p>
        )}
        {updateStatus === "available" && (
          <div>
            <p className="text-xs text-[#FABB18] font-bold mb-3">Yeni versiya mövcuddur: v{newVersion}</p>
            <button onClick={handleUpdate}
              className="w-full py-2.5 rounded-xl text-white font-bold text-sm transition hover:-translate-y-0.5 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)", boxShadow: "0 4px 14px rgba(250,187,24,.3)" }}>
              Yenilə
            </button>
          </div>
        )}
        {updateStatus === "downloading" && (
          <p className="text-xs text-[#FABB18] font-bold">Yüklənir... Proqramı bağlamayın.</p>
        )}
        {updateStatus === "ready" && (
          <p className="text-xs text-green-600 font-bold">Quraşdırılır... Proqram avtomatik yenilənəcək.</p>
        )}
        {updateStatus === "error" && (
          <div>
            <p className="text-xs text-red-500 font-bold mb-2">Xəta: {errorMsg}</p>
            <button onClick={() => setUpdateStatus("available")}
              className="text-xs text-gray-400 underline cursor-pointer">Yenidən cəhd et</button>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <label className="block text-xs font-bold text-gray-400 mb-1.5">{t("settings.restaurantName")}</label>
        <input value={name} onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18] mb-4" />

        <label className="block text-xs font-bold text-gray-400 mb-1.5">{t("settings.currency")}</label>
        <select value={currency} onChange={e => setCurrency(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FABB18] mb-5 cursor-pointer">
          <option value="₼">₼ (Manat)</option>
          <option value="$">$ (Dollar)</option>
          <option value="€">€ (Avro)</option>
          <option value="₽">₽ (Rubl)</option>
        </select>

        <button onClick={save} className="w-full py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer"
          style={{ background: "linear-gradient(135deg,#FABB18,#D4A017)" }}>
          {t("settings.save")}
        </button>
      </div>

      {/* Language */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <label className="block text-xs font-bold text-gray-400 mb-1.5">{t("settings.language")}</label>
        <div className="flex gap-2">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer
                ${lang === l.code
                  ? "text-white shadow-md"
                  : "text-gray-500 bg-gray-50 border border-gray-200 hover:border-gray-300"}`}
              style={lang === l.code ? { background: "linear-gradient(135deg,#FABB18,#D4A017)", boxShadow: "0 4px 14px rgba(250,187,24,.3)" } : {}}>
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
          <p className="text-xs text-red-600 font-bold mb-1">{t("settings.dangerTitle")}</p>
          <p className="text-xs text-red-400 leading-relaxed">{t("settings.dangerDesc")}</p>
        </div>
        <button onClick={resetData} disabled={resetting}
          className="w-full py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer">
          {resetting ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>{t("settings.resetting")}</>) : t("settings.resetButton")}
        </button>
      </div>
    </div>
  );
}
