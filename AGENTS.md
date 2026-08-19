# Rkeeper v2 — Layihə yaddaşı

## Deploy
- **Web (Vercel):** `git push` — Vercel avtomatik build edib deploy edir
- **Desktop (Tauri):** `npm run tauri build` → `.msi` faylı `src-tauri/target/release/bundle/msi/`
- Build: `npm run build` (web) / `npm run tauri build` (desktop)

## Ümumi
- İstifadəçi **Azərbaycan** dilində danışır
- Kodda **emoji istifadə etmə**
- POS app: `src/` (Vite + React 19 + Tailwind v4)
- Website: `web/` (ayrı Vite + React 19 + Tailwind v3 proyekti)
- Supabase: `xzfehndqpmkmarkbsiev.supabase.co` (anon key hardcoded)

## POS App (`src/`)
- **Məntiqi:** localStorage əsas yaddaş, Supabase backup/sync
- **Auth:** lokal users array-i ilə (Supabase Auth istifadə olunmur)
- **Default users:** admin/admin123 (admin), kassa/kassa123 (kassa)
- **Routing:** URL yox, `currentView` state-i ilə
- **Vite plugin:** `vite-plugin-singlefile` — hər şey bir HTML faylına yığılır
- **State:** AppContext.tsx — bütün qlobal state

### Fayllar
| Fayl | Nə üçündür |
|------|-----------|
| `src/App.tsx` | Əsas app shell, view-ləri idarə edir, role-based giriş |
| `src/main.tsx` | Entry point |
| `src/index.css` | Tailwind import + custom keyframes |
| `src/context/AppContext.tsx` | Qlobal state (data, currentUser, currentView, etc.) |
| `src/types/index.ts` | TypeScript tipləri |
| `src/lib/utils.ts` | uid, initialsOf, fmtMoney, fmtTime, etc. |
| `src/lib/storage.ts` | localStorage persistence (default məlumatlar) |
| `src/lib/translations.ts` | i18n: AZ/EN/RU lüğətləri |
| `src/lib/categoryIcons.ts` | Kateqoriya adına uyğun emoji tapma |
| `src/lib/supabase.ts` | Supabase client |
| `src/lib/supabaseApi.ts` | Bütün Supabase CRUD əməliyyatları |
| `src/components/LoginScreen.tsx` | Giriş səhifəsi (split layout, qaranlıq tema, animated blobs) |
| `src/components/Sidebar.tsx` | Navigasiya paneli (desktop: sol, mobile: alt) |
| `src/components/Topbar.tsx` | Üst panel (başlıq + saat) |
| `src/components/ui/Toast.tsx` | Bildiriş komponenti |
| `src/components/ui/Modal.tsx` | Təkrar istifadə edilən modal |
| `src/components/ui/Receipt.tsx` | Termal çek önizləmə |
| `src/components/views/TablesView.tsx` | Masalar grid + statistika |
| `src/components/views/OrderView.tsx` | Sifariş paneli (menyu + səbət + ödəniş) |
| `src/components/views/TakeawayView.tsx` | Paket sifariş idarəsi |
| `src/components/views/OnlineOrdersView.tsx` | Onlayn sifarişlər + WhatsApp |
| `src/components/views/StockView.tsx` | Stok idarəetmə |
| `src/components/views/MenuView.tsx` | Menyu/kateqoriya CRUD |
| `src/components/views/ReportsView.tsx` | Günlük satış hesabatları |
| `src/components/views/UsersView.tsx` | İstifadəçi CRUD |
| `src/components/views/SettingsView.tsx` | Tənzimləmələr (ad, valyuta, dil, reset) |

### Desktop (Tauri)
- `src-tauri/` — Tauri v2 Rust backend
- `src-tauri/Cargo.toml` — Rust dependencies
- `src-tauri/tauri.conf.json` — Tauri konfiqurasiyası (pəncərə, bundle, updater)
- `src-tauri/src/lib.rs` — Tauri commands (print_receipt)
- `src-tauri/src/main.rs` — Desktop entry point
- `src-tauri/capabilities/default.json` — İzinlər
- `src-tauri/icons/` — App icon-ları (logo.png-dən yaradılıb)
- npm scripts: `npm run tauri dev` (development), `npm run tauri build` (release .msi)
- `.msi` faylı: `src-tauri/target/release/bundle/msi/`
- Auto-updater: GitHub Releases vasitəsilə (konfiqurasiya gələcəkdə)

### Rollar
- **admin:** tables, order, takeaway, online, stock, menu, reports, users, settings
- **kassa:** tables, order, takeaway, online, stock

## Website (`web/`)
- React Router v7 ilə 4 səhifə: `/`, `/menu`, `/about`, `/contact`
- Supabase-dən kateqoriya + məhsul oxuyur, `online_orders`-ə yazır
- Tailwind v3, Google Fonts (Inter + Playfair Display)
- vercel.json: bütün route-lar index.html-ə yönləndirilir

### Fayllar
| Fayl | Nə üçündür |
|------|-----------|
| `web/src/App.tsx` | Routing + cart state + scroll-reveal |
| `web/src/components/Header.tsx` | Fixed header, nav, cart badge, mobile menu |
| `web/src/components/Footer.tsx` | Footer, newsletter, sosial linklər |
| `web/src/pages/Home.tsx` | Ana səhifə (hero, featured, testimonials, gallery, FAQ, CTA) |
| `web/src/pages/MenuPage.tsx` | Menyu + cart drawer + sifariş vermə |
| `web/src/pages/About.tsx` | Haqqımızda (story, timeline, values) |
| `web/src/pages/Contact.tsx` | Əlaqə (form + info) |
| `web/src/lib/api.ts` | Supabase API (fetchCategories, fetchProducts, placeOrder) |
| `web/src/lib/categoryIcons.ts` | Kateqoriya emoji sistemi (POS ilə eyni) |
| `web/online_orders.sql` | online_orders cədvəli SQL |

## Supabase Tables
| Table | POS | Web |
|-------|-----|-----|
| categories | read/write | read |
| products | read/write | read |
| orders | read/write | - |
| online_orders | read/write (status) | write (insert) |
| users | read/write | - |
| storage: product-images | upload | read |

## Brand Rəngləri
- `#FABB18` — qızılı (əsas)
- `#D4A017` — tünd qızılı
- `#3F2218` — qəhvəyi
- `#F43F5E` — roz (veb sayt)
- `#E11D48` — tünd roz (veb sayt)
