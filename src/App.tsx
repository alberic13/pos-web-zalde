import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
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
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route System 7 */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Main Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout title="Dashboard Performa Toko">
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <Layout title="POS Kasir Terminal">
                  <PosPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Layout title="Produk di Etalase">
                  <ProductsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Layout title="Kategori Produk">
                  <CategoriesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Layout title="Manajemen Stok Gudang">
                  <InventoryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-orders"
            element={
              <ProtectedRoute>
                <Layout title="Order Pasokan Stok Ke Supplier">
                  <SupplierOrdersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <Layout title="Kontak & Distributor Supplier">
                  <SuppliersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Layout title="Riwayat Transaksi Penjualan">
                  <OrdersHistoryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
};

export default App;
