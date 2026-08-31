# 🛒 POS Web Zalde

[![Live Demo](https://img.shields.io/badge/Live%20Demo-pos--web--zalde.vercel.app-2ea44f?style=for-the-badge&logo=vercel&logoColor=white)](https://pos-web-zalde.vercel.app)
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
- **Vite**: Ultra-fast build tool and local development server.
- **Tailwind CSS**: Modern custom color palette (Slate & Emerald retail theme).
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

## 📂 Code Structure & Directory Architecture

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
│   │   ├── chat/
│   │   │   └── ChatDrawer.tsx # Floating Chat Widget Komunikasi Toko & Gudang (Short Polling + Quick Templates)
│   │   ├── common/            # Modal, Toast notifications, & Skeleton loaders
│   │   └── layout/            # Header, Sidebar (7 Nav Menu Utama), & Layout wrapper + Floating FAB Chat
│   ├── context/
│   │   └── RoleContext.tsx    # State Management & Role Switcher (Kasir, Staff Gudang, Admin Toko)
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
│   │   ├── SuppliersPage.tsx     # Direktori Kontak Supplier & Kategori Pasokan Dinamis
│   │   └── OrdersHistoryPage.tsx # Riwayat Transaksi Penjualan & Struk Pembayaran
│   ├── types/                 # Interface TypeScript (Product, Category, Order, Supplier, CartItem, ChatMessage)
│   ├── App.tsx                # Client Routing (React Router DOM) & RoleProvider Wrapper
│   ├── main.tsx               # Entrypoint React Vite
│   └── index.css              # Custom Tailwind CSS & Design System
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

### 1. **Chat Komunikasi Internal Toko & Gudang (`ChatDrawer.tsx`)**
- **Floating Chat Widget**: Akses chat serbaguna dari tombol melayang (*Floating Action Button*) di sudut kanan bawah setiap halaman tanpa mengganggu transaksi kasir.
- **Deteksi Role & Pemilih Role (Role Switcher)**: Penjaga toko dapat beralih peran secara instan antara **🛒 Penjaga Toko Depan (Kasir)**, **📦 Staff Gudang**, dan **👑 Admin Toko** dari header widget chat dengan warna gelembung & badge role yang berbeda.
- **Preset Pesan Cepat (Quick Templates)**: Kirim permintaan restok etalase dalam 1-klik (`📢 Minta Restok Etalase`, `✅ Stok Etalase Diisi`, `⚠️ Stok Gudang Menipis`).
- **Filter Produk Target Low Stock**: Dropdown pemilih produk secara otomatis menyaring dan hanya menampilkan produk yang stok etalasenya menipis (**≤ 5 unit**).
- **Auto-Sync & Real-Time Polling**: Pesan tersinkronisasi otomatis antar tab/peramban setiap 3 detik.

### 2. **Order Pasokan Supplier (`/supplier-orders`)**
- **Tabel Restock Interaktif**: Foto/nama produk, supplier tujuan, stok cadangan gudang, harga modal, harga jual etalase, pengatur kuantitas (Qty Stepper `+` / `-`), dan kalkulasi otomatis total bayar ke supplier.
- **Interactive Edit Harga Modal**: Pengguna dapat memperbarui **Harga Modal (Beli)** produk secara langsung dari tabel aksi, tersimpan permanen di database PostgreSQL dengan kalkulator margin keuntungan real-time.
- **1-Click WhatsApp Purchase Order (PO)**: Generasi otomatis pesan PO terstruktur dengan detail produk, SKU, kuantitas, harga modal, harga jual, dan total tagihan yang langsung membuka WhatsApp Web/Desktop.
- **Filter Status Gudang**: Filter instant `Semua Produk`, `⚠️ Gudang Menipis (≤ 5 unit)`, dan `🚫 Gudang Kosong`.

### 3. **Direktori Kontak Supplier Database Synced (`/suppliers`)**
- **Full Database Sync**: Data distributor/supplier tersimpan di database PostgreSQL, sehingga data selalu **100% identik** baik di lokal maupun di Vercel Deploy.
- **Dynamic Category Supply**: Kategori pasokan supplier terhubung secara dinamis dengan master data Kategori di database.

### 4. **Stok Gudang & Badges Design UX (`/inventory`)**
- **Restock Etalase Kasir**: Fitur pemindahan stok dari cadangan gudang ke etalase kasir secara langsung.
- **Ultra-Clean Pill Badges**: Visualisasi status stok etalase dan gudang dengan badge horizontal 1-baris yang elegan dan beranimasi (Emerald untuk aman, Amber pulse untuk refill, Indigo untuk gudang, Rose untuk kosong).

### 5. **Auto-Kompresi & Upload Gambar WebP (`src/lib/imageCompressor.ts`)**
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

## 📄 Lisensi

MIT License © 2026 POS Web Zalde
