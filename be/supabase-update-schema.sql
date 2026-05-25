alter table public.admin
add column if not exists role varchar(30) default 'admin';

alter table public.penghuni
add column if not exists nik varchar(30),
add column if not exists tanggal_keluar date;

alter table public.kamar
add column if not exists fasilitas text;

alter table public.pembayaran
add column if not exists keterangan text;
