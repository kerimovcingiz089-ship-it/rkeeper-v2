import { supabase } from "./supabase";
import type { AppData, MenuItem, HistoryRecord, User } from "../types";

/* ─── Products ─────────────────────────────────────────── */

function compressImage(file: File, maxDim = 400, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

export async function uploadProductImage(file: File): Promise<string | null> {
  try {
    const compressed = await compressImage(file);
    const path = `products/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await supabase.storage.from("product-images").upload(path, compressed, { contentType: "image/jpeg" });
    if (error) { console.error("Upload image:", error); return null; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error("uploadProductImage:", err);
    return null;
  }
}

export async function fetchProducts(data: AppData): Promise<MenuItem[] | null> {
  try {
    const { data: rows, error } = await supabase.from("products").select("*");
    if (error) { console.warn("Supabase products fetch:", error); return null; }
    if (!rows?.length) return null;

    return rows.map((item: any) => {
      const matched = data.categories.find(
        (c) => c.id === item.category || c.name.toLowerCase() === String(item.category || "").toLowerCase()
      );
      const catId = matched?.id ?? data.categories[0]?.id ?? "c1";
      return {
        id: String(item.id),
        name: item.name,
        price: Number(item.price),
        categoryId: catId,
        stock: item.stock != null ? Number(item.stock) : 0,
        imageUrl: item.image_url || "",
      };
    });
  } catch (err) {
    console.error("fetchProducts:", err);
    return null;
  }
}

export async function addProduct(name: string, price: number, categoryId: string, imageUrl: string = ""): Promise<void> {
  try {
    const { error } = await supabase.from("products").insert([{ name, price: Number(price), category: Number(categoryId), stock: 0, image_url: imageUrl }]);
    if (error) console.error("Supabase insert product:", error);
  } catch (err) {
    console.error("addProduct:", err);
  }
}

export async function updateProduct(id: string, name: string, price: number, categoryId: string, imageUrl: string = ""): Promise<void> {
  try {
    const { error } = await supabase.from("products").update({ name, price: Number(price), category: Number(categoryId), image_url: imageUrl }).eq("id", id);
    if (error) console.error("Supabase update product:", error);
  } catch (err) {
    console.error("updateProduct:", err);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) console.error("Supabase delete product:", error);
  } catch (err) {
    console.error("deleteProduct:", err);
  }
}

export async function updateStock(id: string, newStock: number): Promise<void> {
  try {
    const { error } = await supabase.from("products").update({ stock: Math.max(0, newStock) }).eq("id", id);
    if (error) console.warn("Supabase stock update:", error.message);
  } catch (err) {
    console.error("updateStock:", err);
  }
}

/* ─── Categories ─────────────────────────────────────────── */

export async function fetchCategories(): Promise<{ id: string; name: string }[] | null> {
  try {
    const { data: rows, error } = await supabase.from("categories").select("*").order("id", { ascending: true });
    if (error) { console.warn("Supabase categories fetch:", error); return null; }
    if (!rows) return null;
    return rows.map((c: any) => ({ id: String(c.id), name: c.name }));
  } catch (err) {
    console.error("fetchCategories:", err);
    return null;
  }
}

export async function addCategory(name: string): Promise<{ id: string; name: string } | null> {
  try {
    const { data, error } = await supabase.from("categories").insert([{ name }]).select();
    if (error) { console.error("Supabase insert category:", error); return null; }
    if (!data?.[0]) return null;
    return { id: String(data[0].id), name: data[0].name };
  } catch (err) {
    console.error("addCategory:", err);
    return null;
  }
}

export async function updateCategory(id: string, name: string): Promise<void> {
  try {
    const { error } = await supabase.from("categories").update({ name }).eq("id", id);
    if (error) console.error("Supabase update category:", error);
  } catch (err) {
    console.error("updateCategory:", err);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) console.error("Supabase delete category:", error);
  } catch (err) {
    console.error("deleteCategory:", err);
  }
}

/* ─── Orders ────────────────────────────────────────────── */

export async function saveOrder(totalPrice: number, items: any[], meta: { tableName?: string; paymentMethod?: string; closedBy?: string; isTakeaway?: boolean } = {}): Promise<void> {
  try {
    const payload = { total_price: Number(totalPrice), items: { _meta: meta, lines: items } };
    const { error } = await supabase.from("orders").insert([payload]);
    if (error) console.error("Supabase insert order:", error);
  } catch (err) {
    console.error("saveOrder:", err);
  }
}

/* ─── Reset ──────────────────────────────────────────────── */

export async function fetchOnlineOrders(): Promise<import("../types").OnlineOrder[] | null> {
  try {
    const { data: rows, error } = await supabase.from("online_orders").select("*").order("created_at", { ascending: false });
    if (error) { console.warn("Supabase online_orders fetch:", error); return null; }
    if (!rows) return null;
    return rows.map((o: any) => ({
      id: String(o.id),
      orderNo: Number(o.id),
      customerName: o.customer_name || "",
      customerPhone: o.customer_phone || "",
      items: Array.isArray(o.items) ? o.items : [],
      total: Number(o.total || 0),
      status: (o.status || "new") as import("../types").OnlineOrderStatus,
      note: o.note || "",
      createdAt: o.created_at ? new Date(o.created_at).getTime() : Date.now(),
    }));
  } catch (err) {
    console.error("fetchOnlineOrders:", err);
    return null;
  }
}

export async function updateOnlineOrderStatus(id: string, status: string): Promise<void> {
  try {
    const { error } = await supabase.from("online_orders").update({ status }).eq("id", id);
    if (error) console.error("Supabase update online_order status:", error);
  } catch (err) {
    console.error("updateOnlineOrderStatus:", err);
  }
}

export async function resetAllData(): Promise<void> {
  try {
    await supabase.from("products").delete().neq("id", -1);
    await supabase.from("orders").delete().neq("id", -1);
    await supabase.from("categories").delete().neq("id", -1);
  } catch (err) {
    console.error("resetAllData:", err);
  }
}

export async function fetchOrders(): Promise<HistoryRecord[] | null> {
  try {
    const { data: rows, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) { console.warn("Supabase orders fetch:", error); return null; }
    if (!rows) return null;

    return rows.map((o: any) => {
      const closedAt = o.created_at ? new Date(o.created_at).getTime() : Date.now();
      const d = new Date(closedAt);
      const dateStr =
        d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");

      let orderItems: any[] = [];
      let meta: Record<string, any> = {};

      if (o.items && typeof o.items === "object" && !Array.isArray(o.items)) {
        meta = o.items._meta || {};
        orderItems = Array.isArray(o.items.lines) ? o.items.lines : [];
      } else {
        orderItems = Array.isArray(o.items) ? o.items : [];
      }

      return {
        id: String(o.id),
        tableName: meta.tableName || o.tableName || o.table_name || "Sifariş #" + o.id,
        items: orderItems,
        total: Number(o.total_price || o.total || 0),
        paymentMethod: meta.paymentMethod || o.paymentMethod || o.payment_method || "cash",
        closedBy: meta.closedBy || o.closedBy || o.closed_by || "Kassir",
        closedAt,
        dateStr,
        isTakeaway: !!(meta.isTakeaway ?? o.isTakeaway ?? o.is_takeaway),
      } as HistoryRecord;
    });
  } catch (err) {
    console.error("fetchOrders:", err);
    return null;
  }
}

/* ─── Users ──────────────────────────────────────────────── */

export async function fetchUsers(): Promise<User[] | null> {
  try {
    const { data: rows, error } = await supabase.from("users").select("*").order("id", { ascending: true });
    if (error) { console.warn("Supabase users fetch:", error); return null; }
    if (!rows) return null;
    return rows.map((u: any) => ({
      id: String(u.id),
      name: u.name,
      username: u.username,
      password: u.password,
      role: u.role,
    }));
  } catch (err) {
    console.error("fetchUsers:", err);
    return null;
  }
}

export async function addUser(name: string, username: string, password: string, role: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.from("users").insert([{ name, username, password, role }]).select();
    if (error) { console.error("Supabase insert user:", error); return null; }
    if (!data?.[0]) return null;
    const u = data[0];
    return { id: String(u.id), name: u.name, username: u.username, password: u.password, role: u.role };
  } catch (err) {
    console.error("addUser:", err);
    return null;
  }
}

export async function updateUser(id: string, fields: { name?: string; username?: string; password?: string; role?: string }): Promise<void> {
  try {
    const patch: Record<string, any> = {};
    if (fields.name != null) patch.name = fields.name;
    if (fields.username != null) patch.username = fields.username;
    if (fields.password != null && fields.password !== "") patch.password = fields.password;
    if (fields.role != null) patch.role = fields.role;
    if (Object.keys(patch).length === 0) return;
    const { error } = await supabase.from("users").update(patch).eq("id", id);
    if (error) console.error("Supabase update user:", error);
  } catch (err) {
    console.error("updateUser:", err);
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) console.error("Supabase delete user:", error);
  } catch (err) {
    console.error("deleteUser:", err);
  }
}
