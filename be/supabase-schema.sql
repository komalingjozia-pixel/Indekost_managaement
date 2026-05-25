create table admin (
  id uuid primary key default gen_random_uuid(),
  username varchar(50) unique not null,
  password varchar(255) not null,
  nama_admin varchar(100) not null,
  role varchar(30) default 'admin',
  created_at timestamp default now()
);

create table kamar (
  id uuid primary key default gen_random_uuid(),
  nomor_kamar varchar(20) not null,
  tipe_kamar varchar(50),
  harga_bulanan numeric not null,
  fasilitas text,
  status varchar(20) default 'kosong',
  created_at timestamp default now()
);

create table penghuni (
  id uuid primary key default gen_random_uuid(),
  nama varchar(100) not null,
  nik varchar(30),
  no_hp varchar(20),
  alamat text,
  tanggal_masuk date,
  tanggal_keluar date,
  id_kamar uuid references kamar(id) on delete set null,
  status varchar(20) default 'aktif',
  created_at timestamp default now()
);

create table pembayaran (
  id uuid primary key default gen_random_uuid(),
  id_penghuni uuid references penghuni(id) on delete cascade,
  bulan varchar(20) not null,
  tahun int not null,
  nominal numeric not null,
  tanggal_bayar date,
  status varchar(20) default 'belum lunas',
  keterangan text,
  created_at timestamp default now()
);
