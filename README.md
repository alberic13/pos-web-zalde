# 🛒 POS Web Zalde

A modern, fast, and responsive **Point of Sale (POS) Terminal, Multi-Warehouse Inventory Management, & Sales Analytics Dashboard** built with **React 18**, **TypeScript**, **Tailwind CSS**, **Node.js Native Serverless API**, **Prisma ORM**, and **PostgreSQL (Local & Neon Cloud)**.

---

## 🛠️ Tech Stack & Architecture

### **Frontend Framework & UI**
- **React 18** (TypeScript): High-performance Single Page Application (SPA).
- **Vite**: Ultra-fast build tool and local development server.
- **Tailwind CSS**: Modern custom color palette (Slate & Emerald retail theme).
- **Recharts**: Interactive sales analytics graphs & financial charts.
- **Lucide React**: Clean & modern iconography.
- **React Router DOM**: SPA client-side routing (`/`, `/pos`, `/products`, `/categories`, `/inventory`, `/supplier-orders`, `/suppliers`, `/orders`).
- **Browser WebP Auto-Compressor**: Built-in client-side image processing utility (`src/lib/imageCompressor.ts`) converting uploaded product images to WebP format (~15 KB – 25 KB) with 95%+ DB payload savings.

### **Backend & Database Architecture**
- **Node.js Native Serverless API**: Lightweight, zero-dependency REST API handler located at `api/index.ts` fully compatible with Vercel Serverless Functions & local Node.js.
- **Prisma ORM**: Type-safe ORM for schema management (`prisma/schema.prisma`).
- **PostgreSQL Database Engine**:
  - **Local Development**: Local PostgreSQL Server (`pos_zalde_dev` on `localhost:5432`) for fast, robust local development.
  - **Production Deployment**: PostgreSQL (Neon Cloud Serverless) for Vercel production hosting.
  - **Full DB Models**: `Category`, `Product` (Dual Stock: Etalase + Gudang), `Order`, `OrderItem`, and `Supplier`.

### **Testing & Deployment**
- **Bun Test Suite**: High-speed integration test runner (`tests/integration.test.ts`) running all 6 test suites against PostgreSQL.
- **Vercel Deployment**: Serverless Functions hosting (`/api/*`) + SPA Client static hosting.
- **Auto DB Push Build Pipeline**: Automated `prisma db push && prisma generate && tsc && vite build` on Vercel deployment.

---

## 📂 Code Structure & Directory Architecture

```text
pos-web-zalde/
├── api/
│   └── index.ts               # Vercel Serverless Function & Local API Server handler (Products, Categories, Orders, Suppliers, Dashboard)
├── docs/
│   └── PRD_POS_Dashboard.md   # Product Requirement Document (Fitur, UI/UX, & Skema DB)
├── prisma/
│   ├── schema.prisma          # Skema Database PostgreSQL (Category, Product, Order, OrderItem, Supplier)
│   ├── syncToCloud.ts         # Skrip penarik & migrasi data lokal PostgreSQL ➔ Neon Cloud PostgreSQL
│   ├── syncFromCloud.ts       # Skrip penarik & migrasi data live Neon Cloud ➔ Local PostgreSQL
│   └── seed.ts                # Script seeding data sampel (Kategori, Produk, Supplier, & Transaksi)
├── src/
│   ├── components/
│   │   ├── common/            # Modal, Toast notifications, & Skeleton loaders
│   │   └── layout/            # Header & Sidebar navigasi 8 menu
│   ├── lib/
│   │   ├── api.ts             # Client API fetch wrapper dengan error handling (CRUD lengkap)
│   │   └── imageCompressor.ts # Browser WebP auto-compressor module (Resize + WebP 75%)
│   ├── pages/
│   │   ├── DashboardPage.tsx     # Dashboard analytics, KPI cards, & grafik omset 7 hari
│   │   ├── PosPage.tsx           # Terminal Kasir POS 
│   │   ├── ProductsPage.tsx      # Katalog Produk Etalase & File Upload WebP
│   │   ├── CategoriesPage.tsx    # CRUD Kategori Produk
│   │   ├── InventoryPage.tsx     # Stok Gudang & Restock Etalase Kasir (Pill Badges UX)
│   │   ├── SupplierOrdersPage.tsx# Order Pasokan Supplier (Qty Stepper, Cost Price Modal, 1-Click WA PO)
│   │   ├── SuppliersPage.tsx     # Direktori Kontak Supplier & Kategori Pasokan Dinamis (Database API)
│   │   └── OrdersHistoryPage.tsx # Riwayat Transaksi Penjualan & Struk Pembayaran
│   ├── types/                 # Interface TypeScript (Product, Category, Order, Supplier, CartItem)
│   ├── App.tsx                # Client Routing (React Router DOM)
│   └── main.tsx               # Entrypoint React Vite
├── tests/
│   └── integration.test.ts    # Integration Test Suite (API ↔ Prisma ORM ↔ PostgreSQL)
├── .env                       # Variabel lingkungan lokal (Local Postgres / Neon Cloud)
├── package.json               # Dependensi & NPM Scripts (dev, server, test, db:push, db:sync:to-cloud, db:sync:from-cloud)
├── tailwind.config.js         # Konfigurasi Tailwind CSS theme
├── vercel.json                # Konfigurasi Vercel deployment & includeFiles Prisma
└── vite.config.ts             # Vite server proxy & rollup manual chunks
```

---

## 🌟 Fitur Utama & Pembaruan Terkini (Recent Updates)

### 1. **Order Pasokan Supplier (`/supplier-orders`)**
- **Tabel Restock Interaktif**: Menampilkan foto/nama produk, supplier tujuan, stok cadangan gudang, harga modal, harga jual etalase, pengatur kuantitas (Qty Stepper `+` / `-`), dan kalkulasi otomatis total bayar ke supplier.
- **Interactive Edit Harga Modal**: Pengguna dapat memperbarui **Harga Modal (Beli)** produk secara langsung dari tabel aksi, tersimpan permanen di database PostgreSQL dengan kalkulator margin keuntungan real-time.
- **1-Click WhatsApp Purchase Order (PO)**: Generasi otomatis pesan PO terstruktur dengan detail produk, SKU, kuantitas, harga modal, harga jual, dan total tagihan yang langsung membuka WhatsApp Web/Desktop.
- **Filter Status Gudang**: Filter instant `Semua Produk`, `⚠️ Gudang Menipis (≤ 5 unit)`, dan `🚫 Gudang Kosong`.

### 2. **Direktori Kontak Supplier Database Synced (`/suppliers`)**
- **Full Database Sync**: Data distributor/supplier kini tersimpan di database PostgreSQL Serverless Cloud (bukan `localStorage`), sehingga data selalu **100% identik** baik di lokal maupun di Vercel Deploy.
- **Dynamic Category Supply**: Kategori pasokan supplier terhubung secara dinamis dengan master data Kategori di database.

### 3. **Stok Gudang & Badges Design UX (`/inventory`)**
- **Restock Etalase Kasir**: Fitur pemindahan stok dari cadangan gudang ke etalase kasir secara langsung.
- **Ultra-Clean Pill Badges**: Visualisasi status stok etalase dan gudang dengan badge horizontal 1-baris yang elegan dan beranimasi (Emerald untuk aman, Amber pulse untuk refill, Indigo untuk gudang, Rose untuk kosong).
- **Pembersihan Kolom Harga Modal**: Menghilangkan kolom harga modal berlebih pada tabel stok gudang untuk memfokuskan antarmuka pada ketersediaan stok fisik dan harga jual etalase.

### 4. **Auto-Kompresi & Upload Gambar WebP (`src/lib/imageCompressor.ts`)**
- Upload file foto produk dari perangkat lokal (JPG, PNG, WebP) dengan kompresi WebP otomatis di browser (resize & kompresi hingga **15 KB – 25 KB**), menghemat storage database hingga **95%+**.

---

## 🧪 Hasil Integration Testing (Pengujian Integrasi)

Pengujian integrasi dilakukan untuk menguji alur komunikasi secara langsung antara **API Serverless Handler, Prisma ORM, dan Database Engine PostgreSQL**.

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
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 1. Health Check Endpoint (/api/health) [4.13ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 2. Category API & Database Integration [163.47ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 3. Product API & Database Integration [17.20ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 4. POS Checkout Transaction & Automatic Stock Deduction [42.17ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 5. Dashboard Analytics Endpoint (/api/dashboard/stats) [174.50ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 6. Database & Validation Error Handling [3.63ms]

 6 pass
 0 fail
 54 expect() calls
Ran 6 tests across 1 file. [364.00ms]
```

---

## 📦 Cara Memulai (Getting Started)

### **Prasyarat**
- Node.js (v18+) atau Bun (v1.0+)
- PostgreSQL Server (Lokal) atau Neon Serverless Cloud PostgreSQL

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
   # Untuk Development Lokal (PostgreSQL Server):
   DATABASE_URL="postgresql://postgres:1234@localhost:5432/pos_zalde_dev?schema=public"
   PORT=3000

   # Untuk Cloud / Production (Neon Serverless PostgreSQL):
   NEON_DATABASE_URL="postgresql://username:password@ep-xxxx.neon.tech/neondb?sslmode=require"
   ```

4. **Sinkronkan skema database & data**:
   ```bash
   # Push skema Prisma ke PostgreSQL lokal:
   npx prisma db push

   # Sinkronkan data lokal ➔ Neon Cloud PostgreSQL:
   npm run db:sync:to-cloud

   # Atau sinkronkan data live Neon Cloud ➔ PostgreSQL lokal:
   npm run db:sync:from-cloud
   ```

5. **Jalankan server pengembangan (Development Server)**:
   * **Terminal 1** (API Server): `npx tsx api/index.ts`
   * **Terminal 2** (Vite Frontend): `npm run dev`

   Buka [http://localhost:5173](http://localhost:5173) di browser Anda.

---

## 📄 Lisensi

MIT License © 2026 POS Web Zalde
