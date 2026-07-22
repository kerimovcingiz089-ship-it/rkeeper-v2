export type Role = "admin" | "kassa";
export type TableStatus = "free" | "open" | "bill";
export type PaymentMethod = "cash" | "card";
export type TakeawayStatus = "waiting" | "ready" | "completed";

export interface AppTable {
  id: string;
  name: string;
  status: TableStatus;
}

export interface Category {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  stock: number;
  imageUrl?: string;
}

export interface OrderLine {
  itemId: string;
  qty: number;
}

export interface HistoryLine {
  name: string;
  qty: number;
  price: number;
}

export interface HistoryRecord {
  id: string;
  tableName: string;
  items: HistoryLine[];
  total: number;
  paymentMethod: PaymentMethod;
  closedBy: string;
  closedAt: number;
  dateStr: string;
  isTakeaway: boolean;
}

export interface TakeawayOrder {
  id: string;
  orderNo: number;
  customerName: string;
  items: HistoryLine[];
  total: number;
  paymentMethod: PaymentMethod;
  status: TakeawayStatus;
  createdAt: number;
  closedBy: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: Role;
}

export interface Settings {
  name: string;
  currency: string;
}

export type OnlineOrderStatus = "new" | "preparing" | "ready" | "completed" | "cancelled";

export interface OnlineOrder {
  id: string;
  orderNo: number;
  customerName: string;
  customerPhone?: string;
  items: HistoryLine[];
  total: number;
  status: OnlineOrderStatus;
  note?: string;
  createdAt: number;
}

export interface AppData {
  settings: Settings;
  tables: AppTable[];
  categories: Category[];
  items: MenuItem[];
  orders: Record<string, { items: OrderLine[] }>;
  history: HistoryRecord[];
  takeawayOrders: TakeawayOrder[];
  onlineOrders: OnlineOrder[];
  nextOnlineOrderNo: number;
  nextTakeawayNo: number;
  nextReceiptNo: number;
  users: User[];
}
