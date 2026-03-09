# Royal Greenland — Sistem Manajemen Kosan

Aplikasi web untuk mengelola operasional kosan/indekos secara digital, mulai dari manajemen kamar, penghuni, pembayaran bulanan, hingga analitik pendapatan.

## Fitur Utama

- **Dashboard & Analytics** — Ringkasan statistik, grafik tren pendapatan bulanan, dan tingkat okupansi kamar
- **Manajemen Kamar** — CRUD data kamar dengan status (tersedia, terisi, maintenance), lantai, tipe, dan harga
- **Manajemen Penghuni** — Data penghuni lengkap dengan tanggal masuk, kamar, dan kontak WhatsApp
- **Pembayaran Bulanan** — Generate tagihan otomatis, tracking status lunas/menunggu/menunggak per bulan
- **Integrasi WhatsApp** — Kirim pesan tagihan langsung ke penghuni via WhatsApp
- **Kelola Admin** — Tambah dan hapus akun admin sistem dengan role-based access control
- **Autentikasi** — Login aman dengan email & password, tanpa registrasi publik

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **State Management:** TanStack React Query, Zustand
- **Charts:** Recharts
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Row Level Security)

## Instalasi & Menjalankan

```bash
# Clone repository
git clone <URL_REPO>

# Masuk ke direktori project
cd royal-greenland

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`.

## Struktur Project

```
src/
├── components/       # Komponen UI (sidebar, chart, dialog, dll)
├── hooks/            # Custom hooks (useRooms, useTenants, usePayments, useAuth)
├── pages/            # Halaman utama (Dashboard, Kamar, Penghuni, Pembayaran, Admin)
├── integrations/     # Konfigurasi Supabase client
├── data/             # Helper & formatter data
└── assets/           # Logo dan aset statis

supabase/
├── functions/        # Edge Functions (manage-users)
└── config.toml       # Konfigurasi Supabase
```

## Keamanan

- Row Level Security (RLS) aktif di semua tabel
- Role-based access control (admin/user) via tabel `user_roles`
- Registrasi publik dinonaktifkan — akun baru hanya bisa dibuat oleh admin
- Edge Functions menggunakan Service Role Key untuk operasi admin

## Lisensi

Hak cipta © Royal Greenland. Seluruh hak dilindungi.
