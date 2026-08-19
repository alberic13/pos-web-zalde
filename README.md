# POS Web Zalde

A modern Point of Sale (POS) & Inventory Dashboard built with **React**, **Vite**, **Tailwind CSS**, **Elysia.js**, and **Prisma ORM** (SQLite).

## 🚀 Features

- **Point of Sale (POS)**: Fast checkout, product selection, category filtering, cart management.
- **Inventory & Products**: Product listing, add/edit products, stock tracking.
- **Category Management**: Category CRUD operations.
- **Order History**: Real-time sales transaction logs.
- **Dashboard & Analytics**: Financial metrics, charts, top products summary.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend API**: Elysia.js (Bun / Node.js)
- **Database**: SQLite with Prisma ORM

## 📦 Getting Started

### Prerequisites

- Node.js (v18+) or Bun
- npm / pnpm / bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/alberic13/pos-web-zalde.git
   cd pos-web-zalde
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   ```

4. Initialize database & seed mock data:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. Run development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 📄 License

MIT
