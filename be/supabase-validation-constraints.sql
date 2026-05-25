create unique index if not exists idx_kamar_nomor_unique
on public.kamar (nomor_kamar);

create unique index if not exists idx_pembayaran_penghuni_bulan_tahun_unique
on public.pembayaran (id_penghuni, bulan, tahun);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_kamar_harga_positive'
  ) THEN
    ALTER TABLE public.kamar
    ADD CONSTRAINT chk_kamar_harga_positive
    CHECK (harga_bulanan > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_pembayaran_nominal_positive'
  ) THEN
    ALTER TABLE public.pembayaran
    ADD CONSTRAINT chk_pembayaran_nominal_positive
    CHECK (nominal > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_kamar_status'
  ) THEN
    ALTER TABLE public.kamar
    ADD CONSTRAINT chk_kamar_status
    CHECK (status IN ('kosong', 'terisi', 'perbaikan'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_penghuni_status'
  ) THEN
    ALTER TABLE public.penghuni
    ADD CONSTRAINT chk_penghuni_status
    CHECK (status IN ('aktif', 'keluar'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_pembayaran_status'
  ) THEN
    ALTER TABLE public.pembayaran
    ADD CONSTRAINT chk_pembayaran_status
    CHECK (status IN ('lunas', 'belum lunas'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_penghuni_nik'
  ) THEN
    ALTER TABLE public.penghuni
    ADD CONSTRAINT chk_penghuni_nik
    CHECK (nik IS NULL OR nik = '' OR nik ~ '^[0-9]{16}$');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_penghuni_no_hp'
  ) THEN
    ALTER TABLE public.penghuni
    ADD CONSTRAINT chk_penghuni_no_hp
    CHECK (no_hp IS NULL OR no_hp ~ '^[0-9]{10,12}$');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_penghuni_tanggal_keluar'
  ) THEN
    ALTER TABLE public.penghuni
    ADD CONSTRAINT chk_penghuni_tanggal_keluar
    CHECK (tanggal_keluar IS NULL OR tanggal_masuk IS NULL OR tanggal_keluar >= tanggal_masuk);
  END IF;
END $$;
