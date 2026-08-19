# 🛒 POS Web Zalde

A modern, fast, and responsive **Point of Sale (POS) Terminal & Sales Analytics Dashboard** built with **React 18**, **TypeScript**, **Tailwind CSS**, **Node.js / Elysia.js Serverless API**, **Prisma ORM**, and **PostgreSQL (Neon Cloud)**.

---

## 🛠️ Tech Stack & Architecture

### **Frontend Framework & UI**
- **React 18** (TypeScript): High-performance Single Page Application (SPA).
- **Vite**: Ultra-fast build tool and local development server.
- **Tailwind CSS**: Modern custom color palette (Slate & Emerald retail theme).
- **Recharts**: Interactive sales analytics graphs & financial charts.
- **Lucide React**: Clean & modern iconography.
- **React Router DOM**: SPA client-side routing (`/`, `/pos`, `/products`, `/categories`, `/orders`).

### **Backend & Database**
- **Node.js / Elysia.js Compatible Serverless API**: Lightweight REST API located at `api/index.ts`.
- **Prisma ORM**: Type-safe database client and schema management (`prisma/schema.prisma`).
- **PostgreSQL (Neon Serverless Cloud)**: Cloud-hosted PostgreSQL database with connection pooling.

### **Testing & Deployment**
- **Bun Test Suite**: High-speed integration test runner (`tests/integration.test.ts`).
- **Vercel Deployment**: Serverless Functions hosting (`/api/*`) + SPA Client static hosting.

---

## 📂 Code Structure & Directory Architecture

```text
pos-web-zalde/
├── api/
│   └── index.ts               # Vercel Serverless Function entrypoint (Zero-dependency Node handler)
├── docs/
│   └── PRD_POS_Dashboard.md   # Product Requirement Document (Fitur, UI/UX, & Skema DB)
├── prisma/
│   ├── schema.prisma          # Skema Database Prisma (Category, Product, Order, OrderItem)
│   ├── seed.ts                # Script seeding data sampel (Kategori, Produk, & Transaksi)
│   └── dev.db                 # Database SQLite lokal (opsional)
├── src/
│   ├── components/
│   │   ├── common/            # Component Modal, Toast notifications, & Skeleton loaders
│   │   └── layout/            # Layout, Header, & Sidebar navigasi
│   ├── lib/
│   │   ├── api.ts             # Client API fetch wrapper dengan error handling transparan
│   │   └── db.ts              # Singleton Proxy PrismaClient dengan lazy initialization
│   ├── pages/
│   │   ├── DashboardPage.tsx  # Dashboard analytics, KPI cards, & grafik 7 hari
│   │   ├── PosPage.tsx        # Terminal Kasir POS (Shortcut keyboard: F2, F4, Esc)
│   │   ├── ProductsPage.tsx   # CRUD Katalog Produk & Filter Stok
│   │   ├── CategoriesPage.tsx # CRUD Kategori Produk
│   │   └── OrdersHistoryPage.tsx # Riwayat Transaksi Penjualan & Struk Pembayaran
│   ├── server/routes/         # Rute logika backend (categories.ts, products.ts, orders.ts, dashboard.ts)
│   ├── types/                 # Interface TypeScript (Product, Category, Order, CartItem)
│   ├── App.tsx                # Client Routing (React Router DOM)
│   └── main.tsx               # Entrypoint React Vite
├── tests/
│   └── integration.test.ts    # Integration Test Suite (API ↔ Prisma ORM ↔ PostgreSQL)
├── .env                       # Variabel lingkungan (DATABASE_URL PostgreSQL Neon)
├── package.json               # Dependensi & NPM Scripts (dev, build, test, db:push, db:seed)
├── tailwind.config.js         # Konfigurasi Tailwind CSS theme
├── vercel.json                # Konfigurasi Vercel deployment & includeFiles Prisma
└── vite.config.ts             # Vite server proxy & rollup manual chunks
```

---

## 🧪 Hasil Integration Testing (Pengujian Integrasi)

Pengujian integrasi dilakukan untuk menguji alur komunikasi secara langsung antara **API Handler, Prisma ORM, dan PostgreSQL Neon Cloud Database**.

### **Perintah Menjalankan Test**
```bash
npm test
# atau
bun test
```

### **Hasil Eksekusi Pengujian (Test Results)**
```text
bun test v1.3.14 (0d9b296a)

tests\integration.test.ts:
(pass) Integration Tests: API ↔ Prisma ORM ↔ PostgreSQL (Neon) > 1. Health Check Endpoint (/api/health)
(pass) Integration Tests: API ↔ Prisma ORM ↔ PostgreSQL (Neon) > 2. Category API & PostgreSQL Integration
(pass) Integration Tests: API ↔ Prisma ORM ↔ PostgreSQL (Neon) > 3. Product API & PostgreSQL Integration
(pass) Integration Tests: API ↔ Prisma ORM ↔ PostgreSQL (Neon) > 4. POS Checkout Transaction & Automatic Stock Deduction
(pass) Integration Tests: API ↔ Prisma ORM ↔ PostgreSQL (Neon) > 5. Dashboard Analytics Endpoint (/api/dashboard/stats)

 5 pass
 0 fail
 42 expect() calls
Ran 5 tests across 1 file. [23.50s]
```

### **Rincian Skenario Pengujian**
1. **Health Check Endpoint (`/api/health`)**: Memastikan API server aktif dan merespons status `200 OK`.
2. **Category API & PostgreSQL Integration**: Menguji operasi `POST`, `GET`, `PUT` kategori via API dan memverifikasi data tersimpan secara konsisten di tabel `Category` PostgreSQL.
3. **Product API & PostgreSQL Integration**: Menguji pembuatan produk baru, pemetaan relasi `categoryId`, pencarian produk, dan pembaruan harga/stok.
4. **POS Checkout Transaction & Automatic Stock Deduction**:
   - Membaca stok produk awal di database PostgreSQL.
   - Menjalankan pesanan checkout POS melalui rute `POST /api/orders`.
   - **Verifikasi Atomik (ACID)**: Memverifikasi bahwa transaksi berhasil membuat record `Order` & `OrderItem` sekaligus **otomatis memotong stok produk secara instan di PostgreSQL** sejumlah barang yang dibeli.
5. **Dashboard Analytics Endpoint (`/api/dashboard/stats`)**: Memastikan agregasi total pendapatan hari/bulan ini, produk terlaris, dan data grafik penjualan terintegrasi dengan akurat dari PostgreSQL.
6. **Automatic Cleanup (`afterAll`)**: Setiap data pengujian otomatis dibersihkan dari PostgreSQL setelah tes selesai (*idempotent test*).

---

## 📦 Cara Memulai (Getting Started)

### **Prasyarat**
- Node.js (v18+) atau Bun (v1.0+)
- Akun PostgreSQL (misal: Neon Serverless Postgres)

### **Langkah Instalasi**

1. **Clone repository & masuk ke direktori**:
   ```bash
   git clone https://github.com/alberic13/pos-web-zalde.git
   cd pos-web-zalde
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable (`.env`)**:
   Buat file `.env` di root proyek dan isi dengan URL database PostgreSQL Anda:
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxxx.neon.tech/neondb?sslmode=require"
   PORT=3000
   ```

4. **Sinkronkan skema database & seed data sampel**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Jalankan server pengembangan (Development Server)**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:5173](http://localhost:5173) (atau port yang ditampilkan Vite) di browser Anda.

---

## 🚀 Fitur Utama POS Web Zalde

- **Terminal Kasir POS**: Pencarian produk instan, filter kategori, hitung PPN 11%, diskon, kalkulasi kembalian otomatis, & modal cetak struk.
- **Shortcut Keyboard Kasir**:
  - `F2`: Fokus cepat ke kolom pencarian produk.
  - `F4` / `Enter`: Buka modal pembayaran & konfirmasi checkout.
  - `Esc`: Batalkan / bersihkan keranjang belanja.
- **Transaksi Atomik (ACID)**: Pengurangan stok produk otomatis di database saat checkout berhasil.
- **Dashboard Analytics**: Visualisasi grafik pendapatan 7 hari, KPI omset, 5 produk terlaris, & alert stok menipis ($\le 5$ unit).
- **Manajemen Inventaris**: CRUD Produk (SKU, Harga Beli, Harga Jual, Stok, Kategori, Foto URL) & Kategori Produk.

---

## 📄 Lisensi

MIT License © 2026 POS Web Zalde
