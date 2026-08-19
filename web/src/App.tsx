import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import MenuPage from "./pages/MenuPage";
import QrMenu from "./pages/QrMenu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { fetchCategories, fetchProducts } from "./lib/api";
import type { Category, Product } from "./lib/api";

export interface CartItem {
  product: Product;
  qty: number;
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (loading || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll("[data-reveal], .reveal").forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, [loading, location]);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const isQrMenu = location.pathname === "/m" || location.pathname.startsWith("/m/");

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      if (existing) return prev.map(c => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product, qty: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(c => c.product.id !== productId));
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) return removeFromCart(productId);
    setCart(prev => prev.map(c => c.product.id === productId ? { ...c, qty } : c));
  }

  function clearCart() { setCart([]); }

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!isQrMenu && <Header cartCount={cartCount} />}
      <main className={isQrMenu ? "flex-1" : "flex-1 pt-16"}>
        {loading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-brand-purple rounded-full animate-spin" />
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home products={products} addToCart={addToCart} />} />
            <Route path="/menu" element={<MenuPage categories={categories} products={products} cart={cart} addToCart={addToCart} updateQty={updateQty} removeFromCart={removeFromCart} clearCart={clearCart} />} />
            <Route path="/m" element={<QrMenu categories={categories} products={products} />} />
            <Route path="/m/:table" element={<QrMenu categories={categories} products={products} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        )}
      </main>
      {!isQrMenu && <Footer />}
    </div>
  );
}
