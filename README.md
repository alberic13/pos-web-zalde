# 🛒 POS Web Zalde

A modern, fast, and responsive **Point of Sale (POS) Terminal & Sales Analytics Dashboard** built with **React 18**, **TypeScript**, **Tailwind CSS**, **Elysia.js Framework**, **Prisma ORM**, **Local XAMPP MySQL**, and **PostgreSQL (Neon Cloud)**.

---

## 🛠️ Tech Stack & Architecture

### **Frontend Framework & UI**
- **React 18** (TypeScript): High-performance Single Page Application (SPA).
- **Vite**: Ultra-fast build tool and local development server.
- **Tailwind CSS**: Modern custom color palette (Slate & Emerald retail theme).
- **Recharts**: Interactive sales analytics graphs & financial charts.
- **Lucide React**: Clean & modern iconography.
- **React Router DOM**: SPA client-side routing (`/`, `/pos`, `/products`, `/categories`, `/orders`).
- **Browser WebP Auto-Compressor**: Built-in client-side image processing utility (`src/lib/imageCompressor.ts`) converting uploaded product images to WebP format (~15 KB – 25 KB) with 95%+ DB payload savings.

### **Backend & Database Architecture**
- **Elysia.js Framework**: Ergonomic, high-performance TypeScript framework (`src/server/index.ts` & `src/server/routes/`) utilizing Elysia plugins (`new Elysia({ prefix: '/api' })`), `@elysiajs/cors`, and strict schema validation (`t.Object()`).
- **Web Standard Serverless Adapter**: Zero-dependency Vercel Serverless adapter (`api/index.ts`) bridging Web Standard `Request`/`Response` to Vercel Serverless Functions.
- **Prisma ORM**: Type-safe ORM for schema management (`prisma/schema.prisma` & `prisma/schema.local.prisma`).
- **Dual-Database Support**:
  - **Local Development**: Local XAMPP MySQL Database (`pos_zalde_dev` on `localhost:3306`) for zero-cost, ultra-fast local testing.
  - **Production Deployment**: PostgreSQL (Neon Cloud Serverless) for Vercel production hosting.
- **Automated Cloud-to-Local Sync**: Dedicated data migration utility (`prisma/syncFromNeonToMySQL.ts`) pulling live cloud data into local MySQL.

### **Testing & Deployment**
- **Bun Test Suite**: High-speed integration test runner (`tests/integration.test.ts`) running all 6 test suites in ~300ms against local MySQL.
- **Vercel Deployment**: Serverless Functions hosting (`/api/*`) + SPA Client static hosting.

---

## 📂 Code Structure & Directory Architecture

```text
pos-web-zalde/
├── api/
│   └── index.ts               # Vercel Serverless Function & Local API Server handler
├── docs/
│   └── PRD_POS_Dashboard.md   # Product Requirement Document (Fitur, UI/UX, & Skema DB)
├── prisma/
│   ├── schema.prisma          # Skema Database PostgreSQL (Vercel / Neon Production)
│   ├── schema.local.prisma    # Skema Database MySQL (XAMPP Development Lokal)
│   ├── syncFromNeonToMySQL.ts # Skrip penarik & migrasi data live Neon Cloud ➔ XAMPP MySQL
│   └── seed.ts                # Script seeding data sampel (Kategori, Produk, & Transaksi)
├── src/
│   ├── components/
│   │   ├── common/            # Modal, Toast notifications, & Skeleton loaders
│   │   └── layout/            # Layout, Header, & Sidebar navigasi
│   ├── lib/
│   │   ├── api.ts             # Client API fetch wrapper dengan error handling
│   │   ├── db.ts              # Singleton Proxy PrismaClient dengan lazy initialization
│   │   └── imageCompressor.ts # Browser WebP auto-compressor module (Resize + WebP 75%)
│   ├── pages/
│   │   ├── DashboardPage.tsx  # Dashboard analytics, KPI cards, & grafik 7 hari
│   │   ├── PosPage.tsx        # Terminal Kasir POS (Shortcut: F2, F4, Esc)
│   │   ├── ProductsPage.tsx   # CRUD Katalog Produk & File Upload WebP
│   │   ├── CategoriesPage.tsx # CRUD Kategori Produk
│   │   └── OrdersHistoryPage.tsx # Riwayat Transaksi Penjualan & Struk Pembayaran
│   ├── server/routes/         # Rute logika backend Elysia.js (categories, products, orders, dashboard)
│   ├── types/                 # Interface TypeScript (Product, Category, Order, CartItem)
│   ├── App.tsx                # Client Routing (React Router DOM)
│   └── main.tsx               # Entrypoint React Vite
├── tests/
│   └── integration.test.ts    # Integration Test Suite (API ↔ Prisma ORM ↔ MySQL / Postgres)
├── .env                       # Variabel lingkungan lokal (XAMPP MySQL / Neon Cloud)
├── package.json               # Dependensi & NPM Scripts (dev, server, test, db:push:local, db:sync:from-cloud)
├── tailwind.config.js         # Konfigurasi Tailwind CSS theme
├── vercel.json                # Konfigurasi Vercel deployment & includeFiles Prisma
└── vite.config.ts             # Vite server proxy & rollup manual chunks
```

---

## 📸 Fitur Unggulan Terbaru: Auto-Kompresi & Upload Gambar WebP

Halaman **Katalog Produk** ([src/pages/ProductsPage.tsx](file:///c:/xampp/htdocs/pos-web-zalde/src/pages/ProductsPage.tsx)) kini dilengkapi fitur pengunggahan foto produk pintar:

1. **Upload File dari Laptop / HP**: Cukup klik atau *drag & drop* file foto produk (JPG, PNG, WebP) langsung dari Galeri/Folder.
2. **Auto-Kompresi WebP Instant**: File gambar di-resize secara proporsional dan dikonversi ke format `.webp` berkualitas tinggi di browser.
   - Ukuran foto besar (misal **2.5 MB**) otomatis menyusut menjadi **hanya 15 KB – 25 KB** (Menghemat penggunaan database hingga **95%+**).
3. **Live Preview & Badge Metrics**: Menampilkan tampilan preview instan beserta status ukuran terkompresi sebelum disimpan.
4. **Dual Mode Input**: Pengguna bebas memilih antara **Upload File (Auto WebP)** atau **URL Teks Manual** (Link internet / path lokal `/products/`).

---

## 🧪 Hasil Integration Testing (Pengujian Integrasi)

Pengujian integrasi dilakukan untuk menguji alur komunikasi secara langsung antara **API Handler, Elysia.js, Prisma ORM, dan Database Engine**.

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
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 1. Health Check Endpoint (/api/health) [7.51ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 2. Category API & Database Integration [41.26ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 3. Product API & Database Integration [15.65ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 4. POS Checkout Transaction & Automatic Stock Deduction [26.61ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 5. Dashboard Analytics Endpoint (/api/dashboard/stats) [28.85ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 6. Database & Validation Error Handling [2.10ms]

 6 pass
 0 fail
 50 expect() calls
Ran 6 tests across 1 file. [314.00ms]
```

---

## 📦 Cara Memulai (Getting Started)

### **Prasyarat**
- Node.js (v18+) atau Bun (v1.0+)
- XAMPP MySQL (Lokal) atau PostgreSQL (Neon Serverless Postgres)

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
   Buat file `.env` di root proyek:
   ```env
   # Untuk Development Lokal (XAMPP MySQL):
   DATABASE_URL="mysql://root:@localhost:3306/pos_zalde_dev"
   PORT=3000

   # Untuk Production (PostgreSQL Neon Cloud):
   # DATABASE_URL="postgresql://username:password@ep-xxxx.neon.tech/neondb?sslmode=require"
   ```

4. **Sinkronkan skema database & data**:
   ```bash
   # Sinkronkan skema ke XAMPP MySQL lokal:
   npm run db:push:local

   # Pilihan A: Tarik & Migrate seluruh data live dari Neon Cloud ke MySQL lokal:
   npm run db:sync:from-cloud

   # Pilihan B: Atau generate data dummy sampel baru:
   # npm run db:seed
   ```

5. **Jalankan server pengembangan (Development Server)**:
   * **Terminal 1** (API Server): `npm run server`
   * **Terminal 2** (Vite Frontend): `npm run dev`

   Buka [http://localhost:5173](http://localhost:5173) di browser Anda.

---

## 🚀 Fitur Utama POS Web Zalde

- **Terminal Kasir POS**: Pencarian produk instan, filter kategori, hitung PPN 11%, diskon, kalkulasi kembalian otomatis, & modal cetak struk.
- **Transaksi Atomik (ACID)**: Pengurangan stok produk otomatis di database saat checkout berhasil via `prisma.$transaction`.
- **Dashboard Analytics**: Visualisasi grafik pendapatan 7 hari, KPI omset, 5 produk terlaris, & alert stok menipis ($\le 5$ unit).
- **Manajemen Inventaris**: CRUD Produk (SKU, Harga Beli, Harga Jual, Stok, Kategori, Auto WebP File Upload) & Kategori Produk.
- **Sinkronisasi Cloud-to-Local**: 1-click penarik data live Neon PostgreSQL ke MySQL XAMPP (`npm run db:sync:from-cloud`).

---

## 📄 Lisensi

MIT License © 2026 POS Web Zalde
