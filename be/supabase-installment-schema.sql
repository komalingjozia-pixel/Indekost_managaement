alter table public.pembayaran
add column if not exists total_dibayar numeric default 0,
add column if not exists sisa_tagihan numeric default 0,
add column if not exists tanggal_lunas date;

create table if not exists public.detail_pembayaran (
  id uuid primary key default gen_random_uuid(),
  id_pembayaran uuid not null references public.pembayaran(id) on delete cascade,
  pembayaran_ke int not null,
  jumlah_bayar numeric not null,
  tanggal_bayar date not null,
  keterangan text,
  created_at timestamp default now()
);

create unique index if not exists idx_detail_pembayaran_ke_unique
on public.detail_pembayaran (id_pembayaran, pembayaran_ke);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_pembayaran_status'
  ) THEN
    ALTER TABLE public.pembayaran DROP CONSTRAINT chk_pembayaran_status;
  END IF;

  ALTER TABLE public.pembayaran
  ADD CONSTRAINT chk_pembayaran_status
  CHECK (status IN ('belum lunas', 'cicil', 'lunas'));
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_detail_jumlah_bayar_positive'
  ) THEN
    ALTER TABLE public.detail_pembayaran
    ADD CONSTRAINT chk_detail_jumlah_bayar_positive
    CHECK (jumlah_bayar > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_pembayaran_total_dibayar'
  ) THEN
    ALTER TABLE public.pembayaran
    ADD CONSTRAINT chk_pembayaran_total_dibayar
    CHECK (total_dibayar >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_pembayaran_sisa_tagihan'
  ) THEN
    ALTER TABLE public.pembayaran
    ADD CONSTRAINT chk_pembayaran_sisa_tagihan
    CHECK (sisa_tagihan >= 0);
  END IF;
END $$;
