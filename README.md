# SIM Kost Web

Sistem Informasi Manajemen Kost berbasis web fullstack untuk kebutuhan akademik dan operasional kost sederhana.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React + Vite + JavaScript |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Backend | Node.js + Express.js |
| Database | Supabase PostgreSQL |
| Auth | bcryptjs + JWT |

## Struktur Project

```
sim-kost-web/
├── FE/          # Frontend React
├── BE/          # Backend Express
└── README.md
```

---

## 1. Install Frontend

```bash
cd FE
npm install
cp .env.example .env
```

Isi file `FE/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Jalankan frontend:

```bash
npm run dev
```

Frontend berjalan di: **http://localhost:5173**

---

## 2. Install Backend

```bash
cd BE
npm install
cp .env.example .env
```

---

## 3. Cara Isi Environment Backend

Edit file `BE/.env`:

```env
PORT=3000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=sim_kost_rahasia_2026
```

| Variabel | Keterangan |
|----------|------------|
| `SUPABASE_URL` | URL project Supabase (Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (**hanya backend**, jangan taruh di frontend) |
| `JWT_SECRET` | Secret untuk token login admin |

---

## 4. Cara Jalankan SQL di Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Buka menu **SQL Editor**
4. Copy seluruh isi file `BE/supabase-schema.sql`
5. Paste dan klik **Run**

**Jika database sudah ada sebelumnya**, jalankan juga secara berurutan:

1. `BE/supabase-update-schema.sql` — menambah kolom NIK, fasilitas, keterangan, dll.
2. `BE/supabase-validation-constraints.sql` — constraint dan index keamanan data
3. `BE/supabase-installment-schema.sql` — kolom cicilan + tabel `detail_pembayaran`

Tabel yang dibuat:
- `admin` — akun administrator
- `kamar` — data kamar kost
- `penghuni` — data penghuni
- `pembayaran` — data pembayaran sewa

---

## 5. Cara Seed Admin

Pastikan `.env` backend sudah diisi, lalu:

```bash
cd BE
npm run seed
```

Admin default:

| Field | Nilai |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |
| Nama | Administrator |

Jika username `admin` sudah ada, seed tidak akan insert ulang.

---

## 6. Cara Login

1. Jalankan backend: `cd BE && npm run dev`
2. Jalankan frontend: `cd FE && npm run dev`
3. Buka browser: http://localhost:5173/login
4. Masukkan:
   - Username: `admin`
   - Password: `admin123`

---

## 7. Daftar Fitur

- Login admin dengan JWT
- Dashboard ringkasan (penghuni, kamar, pembayaran, pendapatan)
- CRUD data penghuni
- CRUD data kamar
- CRUD data pembayaran
- Laporan pembayaran dengan filter bulan & tahun
- Export PDF laporan profesional (jspdf + jspdf-autotable)
- Validasi input frontend & backend
- Constraint database untuk integritas data
- Logout
- Validasi input (frontend & backend)
- Tampilan responsive (mobile-friendly sidebar drawer)

---

## 8. Penjelasan Singkat untuk Presentasi

**SIM Kost Web** adalah aplikasi manajemen kost yang membantu pemilik/admin mengelola operasional harian secara terpusat.

**Masalah yang diselesaikan:**
- Pencatatan penghuni masih manual/terpisah
- Sulit memantau status kamar (kosong/terisi)
- Pembayaran sewa sulit dilacak per bulan

**Solusi:**
- Sistem terintegrasi: penghuni ↔ kamar ↔ pembayaran
- Dashboard real-time untuk monitoring cepat
- Laporan per periode untuk evaluasi keuangan

**Arsitektur:**
- Frontend React memanggil REST API Express
- Backend menggunakan Supabase PostgreSQL sebagai database
- Autentikasi JWT melindungi semua endpoint kecuali login

**Alur demo presentasi:**
1. Login sebagai admin
2. Tambah beberapa kamar
3. Tambah penghuni dan assign kamar
4. Input pembayaran (lunas/belum lunas)
5. Lihat dashboard & laporan

---

## Menjalankan Project (Ringkas)

**Terminal 1 — Backend:**
```bash
cd BE
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd FE
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/api/auth/login` | Login (public) |
| GET | `/api/dashboard/summary` | Ringkasan dashboard |
| GET/POST/PUT/DELETE | `/api/penghuni` | CRUD penghuni |
| GET/POST/PUT/DELETE | `/api/kamar` | CRUD kamar |
| GET/POST/PUT/DELETE | `/api/pembayaran` | CRUD pembayaran |
| GET | `/api/laporan?bulan=&tahun=` | Laporan pembayaran |

Semua endpoint kecuali login memerlukan header:
```
Authorization: Bearer <token>
```
