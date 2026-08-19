# Product Requirement Document (PRD)
## POS & Penjualan Dashboard App (POS-Zalde)

---

### 1. Ringkasan Eksekutif & Tujuan (Executive Summary & Goals)
**Aplikasi POS & Penjualan Dashboard** adalah sistem manajemen Point of Sale (Kasir) dan pemantauan penjualan modern yang dirancang sederhana, intuitif, cepat, dan responsif. Aplikasi ini memudahkan pemilik toko & kasir dalam mengelola katalog produk, melayani pencatatan transaksi secara cepat, serta memantau kesehatan bisnis melalui statistik visual pada dashboard.

* **Target Pengguna**: Pemilik Toko / Admin & Kasir Toko.
* **Tujuan utama**: Efisiensi pencatatan transaksi kasir, manajemen inventaris produk yang mudah, serta visualisasi data penjualan yang transparan.

---

### 2. Arsitektur & Tech Stack
Sesuai kebutuhan teknis dan target deployment:

* **Backend API**: Bun + Elysia.js (Serverless API / Bun Runtime).
* **Frontend**: React + TypeScript (Vite / SPA Architecture).
* **Database & ORM**: PostgreSQL (Hosted di Neon Serverless Postgres) + Prisma ORM.
* **Styling & UI Kit**: TailwindCSS / Modern Vanilla CSS System + Lucide Icons + Recharts (Graphics).
* **Deployment Target**:
  * **Frontend & Backend**: Vercel (React Frontend + Elysia Serverless Functions `/api/*`).
  * **Database**: Neon (Serverless PostgreSQL).

---

### 3. Modul & Fitur Utama (Functional Requirements)

#### 3.1. Modul Dashboard (Overview & Analytics)
* **Metric Cards (KPI)**:
  * Total Omset/Pendapatan (Hari Ini & Bulan Ini).
  * Total Transaksi Penjualan.
  * Total Produk & Alert Stok Menipis (< 5 unit).
* **Charts & Analytics**:
  * Grafik Penjualan Harian/Mingguan (Line/Bar Chart).
  * Widget 5 Produk Terlaris (Top Selling Items).
  * Ringkasan Transaksi Terakhir (Recent Activity Feed).

#### 3.2. Modul Kasir / Point of Sale (POS Terminal)
* **Katalog Produk Cepat**: Search bar instan + filter kategori.
* **Keranjang Belanja (Cart System)**:
  * Tambah/Kurang jumlah item instan.
  * Kalkulasi otomatis Subtotal, Diskon, Pajak (PPN 11%), dan Total Akhir.
  * Input Nominal Bayar & Kalkulasi Kembalian Otomatis.
* **Proses Checkout**:
  * Simpan transaksi ke database & potong stok otomatis.
  * Cetak / Modal Struk Pembayaran (Receipt Modal).

#### 3.3. Modul Manajemen Produk & Kategori (CRUD)
* **Katalog Produk**:
  * List produk dengan pagination, pencarian, & filter.
  * Tambah, Edit, & Hapus Produk (SKU, Nama, Harga Beli, Harga Jual, Stok, Kategori, Foto URL).
* **Manajemen Kategori**:
  * List, Tambah, Edit, Hapus Kategori.

#### 3.4. Modul Riwayat Transaksi (Sales History)
* Daftar histori transaksi lengkap dengan filter rentang tanggal & metode pembayaran.
* Detail transaksi (item yang dibeli, harga, waktu, kasir).

---

### 4. UI/UX Engineering & Design Principles
*(Berdasarkan panduan `frontend-ui-engineering`)*

#### 4.1. Visual Aesthetics (Bebas AI-Default Generic look)
* **Skema Warna Modern & Kontras**: Palette Slate Dark/Light mode dengan aksen Emerald Green (representasi ritel/uang) & Indigo Slate. Tidak menggunakan gradien keunguan generik.
* **Tipografi Hirarkis**: Google Font *Inter* / *Outfit* dengan skala ukuran tegas (`h1`, `h2`, `body`, `small/muted`).
* **Clean Components**: Micro-animations halus pada hover button, card shadow yang tipis (subtle depth), serta radius sudut konsisten (`rounded-lg`).

#### 4.2. Usability & Efficiency (Easy to Use & Fast)
* **Keyboard Shortcuts (Khusus Kasir)**:
  * `F2`: Fokus ke pencarian produk.
  * `F4` / `Enter`: Bayar / Selesaikan Checkout.
  * `Esc`: Batalkan / Bersihkan keranjang.
* **Visual Status & Empty States**:
  * State kosong (empty state) yang informatif dilengkapi ilustrasi/ikon ramah saat keranjang atau data produk kosong.
  * Skeleton Loader saat data sedang dimuat (bukan sekadar spinner acak).
  * Toast Notifications (Sukses simpan, Stok habis, Gagal transaksi).

#### 4.3. Aksesibilitas (WCAG 2.1 AA Standard)
* Ring fokus keyboard yang jelas (`focus-visible:ring-2`).
* Semua tombol dan icon memiliki `aria-label` yang representatif.
* Kontras warna teks memenuhi standar minimal 4.5:1.

#### 4.4. Layout Responsif (Mobile-First to Desktop)
* **POS View (Desktop & Tablet)**: Grid Split Layout (70% Katalog Produk & Filter, 30% Panel Keranjang Checkout).
* **Mobile View (Smartphones)**: Single Column Layout dengan Floating Cart Bottom Sheet untuk kenyamanan akses admin/kasir di smartphone.

---

### 5. Skema Database (Prisma Schema Overview)

```prisma
model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  products  Product[]
  createdAt DateTime  @default(now())
}

model Product {
  id          String      @id @default(cuid())
  sku         String      @unique
  name        String
  price       Float
  costPrice   Float?
  stock       Int
  categoryId  String
  category    Category    @relation(fields: [categoryId], references: [id])
  imageUrl    String?
  items       OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Order {
  id            String      @id @default(cuid())
  orderNumber   String      @unique
  totalAmount   Float
  paymentAmount Float
  changeAmount  Float
  paymentMethod String      @default("CASH") // CASH, QRIS, DEBIT
  items         OrderItem[]
  createdAt     DateTime    @default(now())
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float
}
```

---

### 6. Non-Functional Requirements & Performance Goals
* **Page Load Time**: < 1.2 detik (First Contentful Paint).
* **API Response Time**: < 100ms untuk transaksi checkout & fetch data dashboard.
* **Database Connection**: Connection pooling via Neon Serverless Postgres Client.

---

### 7. Tanggung Jawab Out-of-Scope (Batasan Aplikasi)
* Payment Gateway API live (pembayaran riil).
* Pengelolaan banyak cabang (Multi-outlet).
* Otentikasi OAuth2/SSO kompleks.
