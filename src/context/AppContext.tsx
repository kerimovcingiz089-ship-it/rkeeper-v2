import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { AppData, User } from "../types";
import { loadData, saveData, SESSION_KEY, defaultData } from "../lib/storage";
import { fetchProducts, fetchOrders, updateStock as apiUpdateStock, saveOrder, fetchUsers, addUser, updateUser, deleteUser, resetAllData, fetchCategories } from "../lib/supabaseApi";

/* ─── Types ─────────────────────────────────────────────── */
type View = "tables" | "order" | "takeaway" | "stock" | "menu" | "reports" | "users" | "settings";

interface AppCtx {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  persist: (d: AppData) => void;

  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  currentView: View;
  switchView: (v: View) => void;

  activeTableId: string | null;
  setActiveTableId: (id: string | null) => void;

  activeCatId: string | null;
  setActiveCatId: (id: string | null) => void;

  takeawayCart: { itemId: string; qty: number }[];
  setTakeawayCart: React.Dispatch<React.SetStateAction<{ itemId: string; qty: number }[]>>;

  takeawayActiveCat: string | null;
  setTakeawayActiveCat: (id: string | null) => void;

  takeawayCustomerName: string;
  setTakeawayCustomerName: (n: string) => void;

  reportDate: string;
  setReportDate: (d: string) => void;

  toast: (msg: string) => void;
  toastMsg: string;

  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshCategories: () => Promise<void>;

  /* stock helper */
  updateStockFor: (itemId: string, newStock: number) => Promise<void>;
  /* order save helper */
  saveOrderAndRefresh: (total: number, items: any[], meta?: { tableName?: string; paymentMethod?: string; closedBy?: string; isTakeaway?: boolean }) => Promise<void>;
  /* user CRUD */
  addUserAndRefresh: (name: string, username: string, password: string, role: string) => Promise<User | null>;
  updateUserAndRefresh: (id: string, fields: { name?: string; username?: string; password?: string; role?: string }) => Promise<void>;
  deleteUserAndRefresh: (id: string) => Promise<void>;
  /* reset */
  resetAllDataAndRefresh: () => Promise<void>;
}

const Ctx = createContext<AppCtx>(null as any);
export const useApp = () => useContext(Ctx);

/* ─── Provider ──────────────────────────────────────────── */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataRaw] = useState<AppData>(() => loadData());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>("tables");
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [takeawayCart, setTakeawayCart] = useState<{ itemId: string; qty: number }[]>([]);
  const [takeawayActiveCat, setTakeawayActiveCat] = useState<string | null>(null);
  const [takeawayCustomerName, setTakeawayCustomerName] = useState("");
  const [reportDate, setReportDate] = useState(() => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  });
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function persist(d: AppData) {
    saveData(d);
    setDataRaw(d);
  }

  function setData(updater: React.SetStateAction<AppData>) {
    setDataRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveData(next);
      return next;
    });
  }

  function toast(msg: string) {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 1800);
  }

  /* ── auth ── */
  async function login(username: string, password: string): Promise<boolean> {
    const users = data.users.length > 0 ? data.users : [];
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!user) return false;
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, user.id);
    return true;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }

  /* ── session restore ── */
  useEffect(() => {
    const sid = localStorage.getItem(SESSION_KEY);
    if (sid) {
      const u = data.users.find((x) => x.id === sid);
      if (u) setCurrentUser(u);
    }
  }, []);

  /* ── view switch ── */
  const ROLE_NAV: Record<string, View[]> = {
    admin: ["tables", "order", "takeaway", "stock", "menu", "reports", "users", "settings"],
    kassa: ["tables", "order", "takeaway", "stock", "reports"],
  };

  function switchView(v: View) {
    const allowed = currentUser ? ROLE_NAV[currentUser.role] || [] : [];
    const target = allowed.includes(v) ? v : "tables";
    setCurrentView(target);
    if (target === "reports") refreshOrders();
    if (["stock", "menu", "order", "takeaway"].includes(target)) { refreshCategories(); refreshProducts(); }
  }

  /* ── Supabase refresh ── */
  const refreshCategories = useCallback(async () => {
    const cats = await fetchCategories();
    if (cats) {
      setDataRaw((prev) => {
        const next = { ...prev, categories: cats.length > 0 ? cats : prev.categories };
        saveData(next);
        return next;
      });
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    setDataRaw((prev) => {
      fetchProducts(prev).then((items) => {
        if (items) {
          setDataRaw((p) => {
            const next = { ...p, items };
            saveData(next);
            return next;
          });
        }
      });
      return prev;
    });
  }, []);

  const refreshOrders = useCallback(async () => {
    const history = await fetchOrders();
    if (history) {
      setDataRaw((prev) => {
        const next = { ...prev, history };
        saveData(next);
        return next;
      });
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    const users = await fetchUsers();
    if (users) {
      setDataRaw((prev) => {
        const next = { ...prev, users };
        saveData(next);
        return next;
      });
    }
  }, []);

  /* ── user CRUD helpers ── */
  const addUserAndRefresh = useCallback(async (name: string, username: string, password: string, role: string) => {
    return await addUser(name, username, password, role);
  }, []);

  const updateUserAndRefresh = useCallback(async (id: string, fields: { name?: string; username?: string; password?: string; role?: string }) => {
    await updateUser(id, fields);
  }, []);

  const deleteUserAndRefresh = useCallback(async (id: string) => {
    await deleteUser(id);
  }, []);

  /* ── reset all data ── */
  const resetAllDataAndRefresh = useCallback(async () => {
    await resetAllData();
    setDataRaw((prev) => {
      const fresh = defaultData();
      fresh.users = prev.users;
      fresh.items = [];
      fresh.categories = [];
      fresh.history = [];
      fresh.takeawayOrders = [];
      fresh.orders = {};
      saveData(fresh);
      return fresh;
    });
    await refreshOrders();
  }, []);

  /* ── initial load ── */
  useEffect(() => {
    (async () => {
      await refreshCategories();
      await refreshProducts();
      await refreshOrders();
      await refreshUsers();
    })();
  }, []);

  /* ── stock helper ── */
  const updateStockFor = useCallback(async (itemId: string, newStock: number) => {
    const val = Math.max(0, newStock);
    setDataRaw((prev) => {
      const next = {
        ...prev,
        items: prev.items.map((i) => (i.id === itemId ? { ...i, stock: val } : i)),
      };
      saveData(next);
      return next;
    });
    await apiUpdateStock(itemId, val);
  }, []);

  /* ── order save helper ── */
  const saveOrderAndRefresh = useCallback(async (total: number, items: any[], meta?: { tableName?: string; paymentMethod?: string; closedBy?: string; isTakeaway?: boolean }) => {
    await saveOrder(total, items, meta);
    await refreshOrders();
  }, [refreshOrders]);

  return (
    <Ctx.Provider
      value={{
        data, setData, persist,
        currentUser, login, logout,
        currentView, switchView,
        activeTableId, setActiveTableId,
        activeCatId, setActiveCatId,
        takeawayCart, setTakeawayCart,
        takeawayActiveCat, setTakeawayActiveCat,
        takeawayCustomerName, setTakeawayCustomerName,
        reportDate, setReportDate,
        toast, toastMsg,
        refreshProducts, refreshOrders, refreshUsers, refreshCategories,
        updateStockFor, saveOrderAndRefresh,
        addUserAndRefresh, updateUserAndRefresh, deleteUserAndRefresh,
        resetAllDataAndRefresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
