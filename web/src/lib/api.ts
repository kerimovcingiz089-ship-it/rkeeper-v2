import { supabase } from "./supabase";

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  stock: number;
  imageUrl?: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("id", { ascending: true });
  if (error || !data) return [];
  return data.map((c: any) => ({ id: String(c.id), name: c.name }));
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*");
  if (error || !data) return [];
  return data.map((item: any) => ({
    id: String(item.id),
    name: item.name,
    price: Number(item.price),
    categoryId: String(item.category),
    stock: Number(item.stock ?? 0),
    imageUrl: item.image_url || "",
  }));
}

export async function placeOrder(order: {
  customerName: string;
  customerPhone: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  note?: string;
}): Promise<boolean> {
  const { error } = await supabase.from("online_orders").insert([{
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    items: order.items,
    total: order.total,
    note: order.note || "",
    status: "new",
  }]);
  return !error;
}
