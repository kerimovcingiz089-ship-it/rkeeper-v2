import type { AppData } from "../types";

export const STORAGE_KEY = "rkeeper_local_data_v3";
export const SESSION_KEY = "rkeeper_session_v1";

export function defaultData(): AppData {
  return {
    settings: { name: "Arzum Şirniyyat", currency: "₼" },
    tables: Array.from({ length: 10 }, (_, i) => ({
      id: "t" + (i + 1),
      name: "Masa " + (i + 1),
      status: "free" as const,
    })),
    categories: [
      { id: "c1", name: "Tortlar" },
      { id: "c2", name: "Şirniyyatlar" },
      { id: "c3", name: "Dondurmalar" },
      { id: "c4", name: "İsti İçkilər" },
      { id: "c5", name: "Soyuq İçkilər" },
    ],
    items: [
      { id: "i1",  name: "Napoleon Tort (Dilim)",   price: 8,   categoryId: "c1", stock: 10 },
      { id: "i2",  name: "Red Velvet Tort (Dilim)", price: 9,   categoryId: "c1", stock: 10 },
      { id: "i3",  name: "Şokoladlı Tort (Dilim)",  price: 8.5, categoryId: "c1", stock: 10 },
      { id: "i4",  name: "Cheesecake (Dilim)",       price: 9.5, categoryId: "c1", stock: 10 },
      { id: "i5",  name: "Paxlava",                  price: 4,   categoryId: "c2", stock: 20 },
      { id: "i6",  name: "Şəkərbura",                price: 3.5, categoryId: "c2", stock: 20 },
      { id: "i7",  name: "Şokoladlı Baklava",        price: 5,   categoryId: "c2", stock: 20 },
      { id: "i8",  name: "Kuraba",                   price: 3,   categoryId: "c2", stock: 20 },
      { id: "i9",  name: "Vanil Dondurma (Şar)",     price: 3,   categoryId: "c3", stock: 30 },
      { id: "i10", name: "Şokolad Dondurma (Şar)",   price: 3,   categoryId: "c3", stock: 30 },
      { id: "i11", name: "Frukt Dondurma Kombo",     price: 6,   categoryId: "c3", stock: 15 },
      { id: "i12", name: "Türk Qəhvəsi",             price: 3,   categoryId: "c4", stock: 50 },
      { id: "i13", name: "Espresso",                 price: 3.5, categoryId: "c4", stock: 50 },
      { id: "i14", name: "Cappuccino",               price: 4.5, categoryId: "c4", stock: 50 },
      { id: "i15", name: "Limonad",                  price: 4,   categoryId: "c5", stock: 40 },
      { id: "i16", name: "Milkşeyk",                 price: 6,   categoryId: "c5", stock: 25 },
      { id: "i17", name: "Təzə Sıxılmış Şirə",      price: 5,   categoryId: "c5", stock: 30 },
    ],
    orders: {},
    history: [],
    takeawayOrders: [],
    nextTakeawayNo: 1,
    nextReceiptNo: 1,
    users: [
      { id: "u1", name: "Admin",  username: "admin", password: "admin123", role: "admin" },
      { id: "u2", name: "Kassir", username: "kassa", password: "kassa123", role: "kassa" },
    ],
  };
}

export function loadData(): AppData {
  const def = defaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return def;
    const parsed = JSON.parse(raw);
    return {
      settings:       Object.assign({}, def.settings, parsed.settings),
      tables:         parsed.tables?.length         ? parsed.tables         : def.tables,
      categories:     parsed.categories?.length     ? parsed.categories     : def.categories,
      items:          (parsed.items || def.items).map((item: any) => ({ ...item, stock: item.stock ?? 0 })),
      orders:         parsed.orders         || {},
      history:        parsed.history        || [],
      takeawayOrders: parsed.takeawayOrders || [],
      nextTakeawayNo: parsed.nextTakeawayNo || 1,
      nextReceiptNo:  parsed.nextReceiptNo  || 1,
      users:          parsed.users?.length          ? parsed.users          : def.users,
    };
  } catch {
    return def;
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
