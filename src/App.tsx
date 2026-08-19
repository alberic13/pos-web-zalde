import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { PosPage } from './pages/PosPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { InventoryPage } from './pages/InventoryPage';
import { SupplierOrdersPage } from './pages/SupplierOrdersPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { OrdersHistoryPage } from './pages/OrdersHistoryPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout title="Dashboard Performa Toko">
              <DashboardPage />
            </Layout>
          }
        />
        <Route
          path="/pos"
          element={
            <Layout title="POS Kasir Terminal">
              <PosPage />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout title="Produk di Etalase">
              <ProductsPage />
            </Layout>
          }
        />
        <Route
          path="/categories"
          element={
            <Layout title="Kategori Produk">
              <CategoriesPage />
            </Layout>
          }
        />
        <Route
          path="/inventory"
          element={
            <Layout title="Manajemen Stok Gudang">
              <InventoryPage />
            </Layout>
          }
        />
        <Route
          path="/supplier-orders"
          element={
            <Layout title="Order Pasokan Stok Ke Supplier">
              <SupplierOrdersPage />
            </Layout>
          }
        />
        <Route
          path="/suppliers"
          element={
            <Layout title="Kontak & Distributor Supplier">
              <SuppliersPage />
            </Layout>
          }
        />
        <Route
          path="/orders"
          element={
            <Layout title="Riwayat Transaksi Penjualan">
              <OrdersHistoryPage />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
