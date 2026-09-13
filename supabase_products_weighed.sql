-- Çəkili məhsul (tərəzi barkodu) dəstəyi üçün products cədvəlinə sütunlar
-- Supabase → SQL Editor → bu faylı işlədin

alter table public.products
  add column if not exists is_weighted boolean default false,
  add column if not exists plu_code integer,
  add column if not exists barcode text;

create index if not exists products_plu_code_idx on public.products (plu_code);
create index if not exists products_barcode_idx on public.products (barcode);