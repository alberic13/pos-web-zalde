# 🛒 POS Web Zalde

[![Live Demo](https://img.shields.io/badge/Live%20Demo-pos--web--zalde.vercel.app-2ea44f?style=for-the-badge&logo=vercel&logoColor=white)](https://pos-web-zalde.vercel.app)
[![CI Quality Gate](https://github.com/alberic13/pos-web-zalde/actions/workflows/ci.yml/badge.svg)](https://github.com/alberic13/pos-web-zalde/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React%2018-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma%20ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

> 🌐 **Live Production Demo:** [https://pos-web-zalde.vercel.app](https://pos-web-zalde.vercel.app)

A modern, fast, and responsive **Point of Sale (POS) Terminal, Multi-Warehouse Inventory Management, Real-Time Store & Warehouse Communication Chat, & Sales Analytics Dashboard** built with **React 18**, **TypeScript**, **Tailwind CSS**, **Node.js Native Serverless API**, **Prisma ORM**, and **PostgreSQL (Local & Neon Cloud)**.

---

## 🔄 Workflow Operasional & Hak Akses 3 Role

```mermaid
flowchart LR
    %% Styling Classes
    classDef roleAdmin fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#f3e8ff
    classDef roleKasir fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5
    classDef roleGudang fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#fffbeb
    classDef stepNode fill:#0f172a,stroke:#334155,stroke-width:1.5px,color:#f8fafc
    classDef highlightNode fill:#065f46,stroke:#34d399,stroke-width:2px,color:#ffffff

    %% 1. ROLES DEFINITION
    subgraph ROLES[" 👥 3 ROLE & HAK AKSES HASIL "]
        direction TB
        ADMIN["👑 <b>ADMIN (BOS)</b><br/>• Full Access Semua Halaman<br/>• Dashboard, POS, Produk, Stok, Supplier, Chat, Reports"]:::roleAdmin
        KASIR["🛒 <b>PENJAGA TOKO (KASIR)</b><br/>• POS Kasir (/pos)<br/>• Produk Etalase (/products)<br/>• Riwayat Transaksi (/orders)<br/>• Chat Toko & Gudang"]:::roleKasir
        GUDANG["📦 <b>STAFF GUDANG</b><br/>• Produk Etalase (/products)<br/>• Kategori Produk (/categories)<br/>• Stok Gudang (/inventory)<br/>• Chat Toko & Gudang"]:::roleGudang
    end

    %% 2. KASIR WORKFLOW
    subgraph KASIR_FLOW[" 🛒 WORKFLOW KASIR (TOKO DEPAN) "]
        direction TB
        K1["1️⃣ Buka Terminal POS Kasir"]:::stepNode --> K2["2️⃣ Layani Transaksi Pembeli"]:::stepNode
        K2 --> K3{"Stok Etalase ≤ 5?"}:::stepNode
        K3 -- Ya --> K4["📢 Kirim Chat Restok ke Gudang"]:::stepNode
        K2 --> K5["🔔 Penutupan Toko (Daily Closing)"]:::stepNode
        K5 --> K6["📊 Export & Simpan Laporan Excel Harian"]:::highlightNode
    end

    %% 3. GUDANG WORKFLOW
    subgraph GUDANG_FLOW[" 📦 WORKFLOW STAFF GUDANG "]
        direction TB
        G1["📩 Terima Notifikasi Chat Restok"]:::stepNode --> G2["🔍 Cek Stok Cadangan Gudang"]:::stepNode
        G2 --> G3["🚚 Transfer Stok Gudang ke Etalase"]:::stepNode
        G3 --> G4["✅ Konfirmasi Selesai via Chat"]:::stepNode
    end

    %% CONNECTIVITY
    KASIR ==> KASIR_FLOW
    GUDANG ==> GUDANG_FLOW
    ADMIN -. Akses Penuh .-> KASIR_FLOW
    ADMIN -. Akses Penuh .-> GUDANG_FLOW
```

---

## 🛠️ Tech Stack & Architecture

### **Frontend Framework & UI**
- **React 18** (TypeScript): High-performance Single Page Application (SPA).
- **Vite**: Ultra-fast build tool and local development server with chunk splitting (`vendor`, `recharts`, `icons`).
- **Retro-Modern System 7 Mac OS Design System**: Custom nostalgic Mac OS Classic theme (window titlebars, traffic light controls, beveled mac-buttons, mac-tables, dan rainbow badge).
- **Modular & Anti-Monolith Architecture**: 100% file mematuhi batas SRP (Single Responsibility Principle) & hard ceiling < 200 baris per file.
- **Custom Hooks Separation**: Seluruh state management dan interaksi API dipisahkan dari layer view (`usePos`, `useInventory`, `useSupplierOrders`, `useDashboard`, `useChat`, dll).
- **Centralized Shared Utilities**: Standardisasi helper format (`format.ts`) dan penanganan error bertipe ketat (`error.ts`).
- **Recharts**: Interactive sales analytics graphs & financial charts.
- **Lucide React**: Clean & modern iconography.
- **React Router DOM**: SPA client-side routing (`/`, `/pos`, `/products`, `/categories`, `/inventory`, `/supplier-orders`, `/suppliers`, `/orders`).
- **Role Context & State Management**: Global user role manager (`src/context/RoleContext.tsx`) for switching between **Kasir (Toko Depan)**, **Staff Gudang**, and **Admin Toko** with `localStorage` persistence.
- **Browser WebP Auto-Compressor**: Built-in client-side image processing utility (`src/lib/imageCompressor.ts`) converting uploaded product images to WebP format (~15 KB – 25 KB) with 95%+ DB payload savings.

### **Backend & Database Architecture**
- **Node.js Native Serverless API**: Lightweight, zero-dependency REST API handler located at `api/index.ts` fully compatible with Vercel Serverless Functions & local Node.js.
- **Prisma ORM**: Type-safe ORM for schema management (`prisma/schema.prisma`).
- **PostgreSQL Database Engine**:
  - **Local Development**: Local PostgreSQL Server (`pos_zalde_dev` on `localhost:5432`) for fast, robust local development.
  - **Production Deployment**: PostgreSQL (Neon Cloud Serverless) for Vercel production hosting.
  - **Full DB Models**: `Category`, `Product` (Dual Stock: Etalase + Gudang), `Order`, `OrderItem`, `Supplier`, and `ChatMessage`.

### **Testing & Deployment**
- **Bun Test Suite**: High-speed integration test runner (`tests/integration.test.ts`) running all 7 test suites against PostgreSQL.
- **TypeScript Typecheck**: Strict `tsc --noEmit` dengan 0 compile error.
- **Vercel Deployment**: Serverless Functions hosting (`/api/*`) + SPA Client static hosting.
---

## 🗄️ Entity Relationship Diagram (ERD)

Visualisasi relasi antar entitas database PostgreSQL (Prisma ORM):

```mermaid
erDiagram
    Category ||--o{ Product : "contains (1-to-N)"
    Product ||--o{ OrderItem : "ordered_in (1-to-N)"
    Order ||--o{ OrderItem : "includes (1-to-N)"

    Category {
        string id PK
        string name UK
        datetime createdAt
    }

    Product {
        string id PK
        string sku UK
        string name
        float price
        float costPrice
        int stock "Stok Etalase"
        int warehouseStock "Stok Gudang"
        string categoryId FK
        string imageUrl
        datetime createdAt
        datetime updatedAt
    }

    Order {
        string id PK
        string orderNumber UK
        float totalAmount
        float paymentAmount
        float changeAmount
        string paymentMethod
        datetime createdAt
    }

    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        int quantity
        float price
    }

    Supplier {
        string id PK
        string companyName
        string contactPerson
        string phone
        string whatsapp
        string email
        string address
        string categorySupply
        string notes
        datetime createdAt
        datetime updatedAt
    }

    ChatMessage {
        string id PK
        string senderRole "KASIR | GUDANG | ADMIN"
        string senderName
        string message
        boolean isQuickMsg
        datetime createdAt
    }
```

---

## 📂 Code Structure & Modular Architecture

Struktur direktori menerapkan prinsip **One-Shot Modular** & **Colocation**:
- Komponen UI dipisah berdasarkan domain fungsional (`pos`, `inventory`, `orders`, `suppliers`, `supplier-orders`, `categories`, `dashboard`, `chat`, `auth`).
- State logic dipisahkan ke dedicated **Custom Hooks** (`use*.ts`).
- Semua file berada di bawah batas keras **< 200 baris** (Pages rata-rata < 85 baris).

```text
pos-web-zalde/
├── api/
│   └── index.ts               # Serverless API Handler (Products, Categories, Orders, Suppliers, Chat, Dashboard)
├── docs/
│   └── PRD_POS_Dashboard.md   # Product Requirement Document (Fitur, UI/UX, & Skema DB)
├── prisma/
│   ├── schema.prisma          # Skema Database PostgreSQL (Category, Product, Order, OrderItem, Supplier, ChatMessage)
│   ├── syncToCloud.ts         # Skrip penarik & migrasi data lokal PostgreSQL ➔ Neon Cloud PostgreSQL
│   ├── syncFromCloud.ts       # Skrip penarik & migrasi data live Neon Cloud ➔ Local PostgreSQL
│   └── seed.ts                # Script seeding data sampel (Kategori, Produk, Supplier, & Transaksi)
├── src/
│   ├── components/
│   │   ├── auth/              # System7LoginWindow, System7TopMenuBar, useLogin
│   │   ├── categories/        # CategoryCardGrid, CategoryFormModal, useCategories
│   │   ├── chat/              # ChatDrawer, useChat (Internal Store & Warehouse Messaging)
│   │   ├── common/            # Modal, Toast, Skeleton, ProductImage (Shared Reusable UI)
│   │   ├── dashboard/         # DashboardKpiCards, SalesAreaChart, LowStockAlertTable, useDashboard
│   │   ├── inventory/         # InventoryTable, InventoryTableRow, InventoryMetricsHeader,
│   │   │                      # ProductDetailModal, ProductFormModal, TransferStockModal,
│   │   │                      # WarehouseRestockModal, DeleteConfirmModal, useInventory,
│   │   │                      # useProductForm, useStockTransfer
│   │   ├── layout/            # System7TopMenuBar, Layout wrapper, FAB Chat button
│   │   ├── orders/            # OrdersTable, OrderDetailReceiptModal, OrdersKpis, useOrdersHistory
│   │   ├── pos/               # CartPanel, ProductCatalogGrid, CheckoutPaymentModal,
│   │   │                      # ReceiptModal, PosHeaderBar, usePos, usePosCheckout, useCart
│   │   ├── supplier-orders/   # SupplierOrderTable, SupplierOrderKpis, EditCostPriceModal,
│   │   │                      # useSupplierOrders, useEditCostPrice
│   │   └── suppliers/         # SupplierCardGrid, SupplierFormModal, useSuppliers,
│   │                          # useSupplierModal, useDeleteSupplier
│   ├── context/
│   │   └── RoleContext.tsx    # State Management & Role Switcher (Kasir, Staff Gudang, Admin Toko)
│   ├── lib/
│   │   ├── api.ts             # Client API fetch wrapper dengan error handling & fallback login
│   │   └── imageCompressor.ts # Browser WebP auto-compressor module (Resize + WebP 75%)
│   ├── pages/                 # Orchestrator Container tipis (< 85 baris)
│   │   ├── DashboardPage.tsx     # Dashboard analytics & grafik omset harian
│   │   ├── PosPage.tsx           # Terminal Kasir POS
│   │   ├── ProductsPage.tsx      # Katalog Produk Etalase & File Upload WebP
│   │   ├── CategoriesPage.tsx    # CRUD Kategori Produk
│   │   ├── InventoryPage.tsx     # Stok Gudang & Restock Etalase Kasir
│   │   ├── SupplierOrdersPage.tsx# Order Pasokan Supplier (Qty Stepper, Cost Price Modal, WA PO)
│   │   ├── SuppliersPage.tsx     # Direktori Kontak Supplier & WhatsApp Quick Chat
│   │   ├── OrdersHistoryPage.tsx # Riwayat Transaksi Penjualan, Struk, & Export Excel
│   │   └── LoginPage.tsx         # Classic System 7 Login Page
│   ├── types/                 # Interface TypeScript (Product, Category, Order, Supplier, CartItem, ChatMessage)
│   ├── utils/
│   │   ├── format.ts          # Centralized Formatters (Currency IDR, Date, Time, WhatsApp Sanitizer)
│   │   └── error.ts           # Strict Unknown Error Parser (getErrorMessage)
│   ├── App.tsx                # Client Routing (React Router DOM) & RoleProvider Wrapper
│   ├── main.tsx               # Entrypoint React Vite
│   └── index.css              # Custom System 7 Retro Theme & Tailwind CSS Design Tokens
├── tests/
│   └── integration.test.ts    # Integration Test Suite (API ↔ Prisma ORM ↔ PostgreSQL - 7 Test Cases)
├── .env                       # Variabel lingkungan lokal (Local Postgres / Neon Cloud)
├── package.json               # Dependensi & NPM Scripts (dev, server, test, lint, db:push, db:sync:to-cloud)
├── tailwind.config.js         # Konfigurasi Tailwind CSS theme
├── vercel.json                # Konfigurasi Vercel deployment & includeFiles Prisma
└── vite.config.ts             # Vite server proxy & rollup manual chunks
```

---

## 🌟 Fitur Utama & Pembaruan Terkini (Recent Updates)

### 1. **Penyempurnaan Arsitektur & Clean Code (Zero-Monolith Refactor)**
- **Sentralisasi Format Helpers (`src/utils/format.ts`)**:
  - Standarisasi `formatCurrency` (IDR), `formatDate`, `formatTime`, dan `cleanWhatsAppNumber`.
  - Mengeliminasi deklarasi `Intl.NumberFormat` berulang di belasan komponen.
- **Sentralisasi Error Handling (`src/utils/error.ts`)**:
  - Fungsi `getErrorMessage(error: unknown)` yang aman dari runtime crash (menangani instance `Error`, objek API respons, dan fallback string).
  - 100% bebas dari `catch (err: any)` liar pada seluruh 25 blok catch di frontend hooks & API client.
- **Deduplikasi Komponen Gambar (`src/components/common/ProductImage.tsx`)**:
  - Komponen tunggal dengan fallback placeholder aman jika gambar rusak atau tidak tersedia.
  - Dipakai seragam di katalog POS, keranjang, purchase order supplier, etalase produk, dan inventaris gudang.
- **Single Responsibility Principle (SRP)**:
  - Seluruh file `< 200 baris` (file halaman rata-rata hanya `50 - 85 baris`).
  - Pemisahan total antara rendering UI dan logika bisnis/state.

### 2. **Chat Komunikasi Internal Toko & Gudang (`ChatDrawer.tsx`)**
- **Floating Chat Widget**: Akses chat serbaguna dari tombol melayang (*Floating Action Button*) di sudut kanan bawah setiap halaman tanpa mengganggu transaksi kasir.
- **Deteksi Role & Pemilih Role (Role Switcher)**: Penjaga toko dapat beralih peran secara instan antara **🛒 Penjaga Toko Depan (Kasir)**, **📦 Staff Gudang**, dan **👑 Admin Toko** dari header widget chat dengan warna gelembung & badge role yang berbeda.
- **Preset Pesan Cepat (Quick Templates)**: Kirim permintaan restok etalase dalam 1-klik (`📢 Minta Restok Etalase`, `✅ Stok Etalase Diisi`, `⚠️ Stok Gudang Menipis`).
- **Filter Produk Target Low Stock**: Dropdown pemilih produk secara otomatis menyaring dan hanya menampilkan produk yang stok etalasenya menipis (**≤ 5 unit**).
- **Auto-Sync & Real-Time Polling**: Pesan tersinkronisasi otomatis antar tab/peramban setiap 3 detik.

### 3. **Order Pasokan Supplier (`/supplier-orders`)**
- **Tabel Restock Interaktif**: Foto/nama produk, supplier tujuan, stok cadangan gudang, harga modal, harga jual etalase, pengatur kuantitas (Qty Stepper `+` / `-`), dan kalkulasi otomatis total bayar ke supplier.
- **Interactive Edit Harga Modal**: Pengguna dapat memperbarui **Harga Modal (Beli)** produk secara langsung dari tabel aksi, tersimpan permanen di database PostgreSQL dengan kalkulator margin keuntungan real-time.
- **1-Click WhatsApp Purchase Order (PO)**: Generasi otomatis pesan PO terstruktur dengan detail produk, SKU, kuantitas, harga modal, harga jual, dan total tagihan yang langsung membuka WhatsApp Web/Desktop.
- **Filter Status Gudang**: Filter instant `Semua Produk`, `⚠️ Gudang Menipis (≤ 5 unit)`, dan `🚫 Gudang Kosong`.

### 4. **Direktori Kontak Supplier Database Synced (`/suppliers`)**
- **Full Database Sync**: Data distributor/supplier tersimpan di database PostgreSQL, sehingga data selalu **100% identik** baik di lokal maupun di Vercel Deploy.
- **Dynamic Category Supply**: Kategori pasokan supplier terhubung secara dinamis dengan master data Kategori di database.
- **One-Click WhatsApp Chat**: Tombol cepat untuk membuka chat WhatsApp langsung ke nomor supplier dengan sanitasi format nomor otomatis (`cleanWhatsAppNumber`).

### 5. **Stok Gudang & Badges Design UX (`/inventory`)**
- **Restock Etalase Kasir**: Fitur pemindahan stok dari cadangan gudang ke etalase kasir secara langsung via modal transfer.
- **Penambahan Pasokan Gudang**: Form cepat untuk menambah stok cadangan gudang saat barang baru tiba dari supplier.
- **Ultra-Clean Pill Badges**: Visualisasi status stok etalase dan gudang dengan badge horizontal 1-baris yang elegan dan beranimasi (Emerald untuk aman, Amber pulse untuk refill, Indigo untuk gudang, Rose untuk kosong).

### 6. **Terminal Kasir POS & Struk Transaksi (`/pos`)**
- **Katalog & Filter Cepat**: Filter kategori instan, pencarian nama/SKU, dan indikator stok habis.
- **Keranjang & Kalkulasi Pajak**: Penyesuaian kuantitas fleksibel, validasi batas stok, perhitungan subtotal, dan PPN 11%.
- **Modal Pembayaran & Kembalian**: Pilihan metode Cash / QRIS, tombol uang pas dan pecahan cepat (20k, 50k, 100k, 200k), serta kalkulasi kembalian otomatis.
- **Cetak Struk Transaksi**: Struk monospaced bergaya retro kasir dengan rincian per item dan tombol cetak struk (`window.print()`).

### 7. **Laporan & Penutupan Harian (`/orders`)**
- **Daily Closing Summary**: Rangkuman transaksi hari berjalan (omset harian, total transaksi, rata-rata transaksi).
- **Export Laporan Excel (CSV)**: Unduh rekapitulasi penjualan harian lengkap dalam format CSV yang kompatibel dengan Microsoft Excel dan Google Sheets.

### 8. **Auto-Kompresi & Upload Gambar WebP (`src/lib/imageCompressor.ts`)**
- Upload file foto produk dari perangkat lokal (JPG, PNG, WebP) dengan kompresi WebP otomatis di browser (resize & kompresi hingga **15 KB – 25 KB**), menghemat storage database hingga **95%+**.

---

## 🧪 Hasil Pengujian Kualitas & Integrasi (Lint & Testing)

Pengujian kualitas kode dan integrasi dilakukan untuk memverifikasi type-safety TypeScript, kebersihan kode, serta integritas alur komunikasi **API Serverless Handler, Prisma ORM, dan Database Engine PostgreSQL**.

### 1. **Linting & Type-Safety Check**
```bash
npm run lint
# atau
npx tsc --noEmit
```

**Hasil Linting:**
```text
> pos-web-zalde@1.0.0 lint
> tsc --noEmit

✔ Type-checking passed with 0 errors across all frontend and backend modules.
```

---

### 2. **Integration Testing (Bun Test)**
```bash
npm test
# atau
bun test
```

**Hasil Eksekusi Pengujian (Test Results):**
```text
bun test v1.3.14 (0d9b296a)

tests\integration.test.ts:
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 1. Health Check Endpoint (/api/health) [7.57ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 2. Category API & Database Integration [63.16ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 3. Product API & Database Integration [13.60ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 4. POS Checkout Transaction & Automatic Stock Deduction [23.54ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 5. Dashboard Analytics Endpoint (/api/dashboard/stats) [110.86ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 6. Database & Validation Error Handling [2.26ms]
(pass) Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database > 7. Store & Warehouse Internal Chat API [14.06ms]

 7 pass
 0 fail
 71 expect() calls
Ran 7 tests across 1 file. [411.00ms]
```

---

### 3. **Production Bundle Build (Vite)**
```bash
npx vite build
```

**Hasil Build:**
```text
✓ 2455 modules transformed.
dist/index.html                     1.10 kB │ gzip:   0.56 kB
dist/assets/index-I8ILNd_M.css     32.71 kB │ gzip:   6.78 kB
dist/assets/icons-agdkO0XV.js      21.59 kB │ gzip:   4.66 kB
dist/assets/index-DV5qnxV_.js     133.35 kB │ gzip:  29.04 kB
dist/assets/vendor-9jdMLHbg.js    163.73 kB │ gzip:  53.42 kB
dist/assets/recharts-BHGE68XP.js  383.11 kB │ gzip: 105.64 kB
✓ built in 6.99s
```

---

### 4. **SRP & Code Complexity Audit (Hard Ceiling < 200 Baris)**
Seluruh berkas kode TypeScript & TSX dipindai secara otomatis:
```powershell
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | ForEach-Object {
  $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
  if ($lines -gt 200) { "$($_.FullName): $lines lines" }
}
```
**Hasil:** `0 files found` (100% file mematuhi batas keras < 200 baris, arsitektur anti-monolitik).

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
   * **Terminal 1** (API Server): `npx tsx api/index.ts / bun api/index.ts`
   * **Terminal 2** (Vite Frontend): `npm run dev / bun run dev`

    Buka [http://localhost:5173](http://localhost:5173) di browser Anda.

---

## 🔑 Kredensial Akun Demo (Default Logins)

Untuk mencoba 3 role dengan hak akses berbeda, gunakan akun berikut pada halaman login (`/login`):

| Role | Username | Password | Hak Akses Utama |
|---|---|---|---|
| **Admin Toko** | `admin` | `admin123` | Akses penuh (Dashboard, POS, Produk, Stok, Supplier, Chat, Reports) |
| **Kasir (Toko Depan)** | `kasir` | `kasir123` | POS Kasir, Produk Etalase, Riwayat Transaksi, Chat Toko & Gudang |
| **Staff Gudang** | `gudang` | `gudang123` | Stok Gudang, Transfer Etalase, Kategori, Produk, Chat Toko & Gudang |

---

## 🔌 Dokumentasi REST API Serverless (`/api/*`)

| Endpoint | Method | Deskripsi |
|---|---|---|
| `/api/health` | `GET` | Health check endpoint serverless & konektivitas DB |
| `/api/auth/login` | `POST` | Autentikasi pengguna & pembuatan token role |
| `/api/products` | `GET`, `POST` | List katalog produk & pembuatan produk baru |
| `/api/products/:id` | `PUT`, `DELETE` | Update detail/harga produk & hapus produk |
| `/api/products/:id/transfer-to-display` | `POST` | Transfer stok fisik dari gudang ke etalase toko |
| `/api/categories` | `GET`, `POST` | List & tambah kategori produk |
| `/api/categories/:id` | `PUT`, `DELETE` | Update nama kategori & hapus kategori |
| `/api/orders` | `GET`, `POST` | List riwayat order & checkout transaksi POS baru |
| `/api/suppliers` | `GET`, `POST` | List & tambah data distributor/supplier |
| `/api/suppliers/:id` | `PUT`, `DELETE` | Update informasi supplier & hapus supplier |
| `/api/chat/messages` | `GET`, `POST`, `DELETE` | Polling chat internal, kirim pesan, & bersihkan riwayat chat |
| `/api/dashboard/stats` | `GET` | Agregasi analitik KPI, tren omset 7 hari, & low stock alert |

---

## 📄 Lisensi

MIT License © 2026 POS Web Zalde
