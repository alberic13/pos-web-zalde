import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Product, Category } from '../types';
import { TableSkeleton } from '../components/common/Skeleton';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import {
  Search,
  Package,
  Image as ImageIcon,
} from 'lucide-react';

const ProductImage: React.FC<{ src?: string | null; alt: string; className?: string }> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
}) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
        <ImageIcon className="w-4 h-4" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        api.getProducts(search, selectedCategory),
        api.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      addToast('error', 'Gagal memuat produk', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-5 animate-fade-in font-sans text-black">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header Actions Mac OS Window */}
      <div className="mac-window p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mac-input w-full pl-9 pr-4 py-1.5 text-xs font-semibold placeholder-gray-600 shadow-inner"
          />
        </div>

        {/* Filter Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mac-select w-full sm:w-auto text-xs cursor-pointer"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table Container Mac OS Window */}
      <div className="mac-window p-0 overflow-hidden">
        <div className="mac-window-header">
          <h3 className="text-xs font-black uppercase text-black">
            Katalog Produk Etalase Kasir
          </h3>
        </div>

        <div className="p-3 bg-white">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="mac-table">
                <thead>
                  <tr>
                    <th className="mac-th">Produk</th>
                    <th className="mac-th">SKU</th>
                    <th className="mac-th">Kategori</th>
                    <th className="mac-th">Harga Jual</th>
                    <th className="mac-th">Stok Etalase</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="mac-tr">
                      <td className="mac-td">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 border border-black overflow-hidden shrink-0 flex items-center justify-center">
                            <ProductImage src={product.imageUrl} alt={product.name} />
                          </div>
                          <div>
                            <span className="font-extrabold text-black block text-xs">{product.name}</span>
                            <span className="text-[10px] text-gray-700 font-semibold">Kasir Etalase</span>
                          </div>
                        </div>
                      </td>

                      <td className="mac-td font-mono font-bold text-xs">{product.sku}</td>

                      <td className="mac-td">
                        <span className="mac-badge mac-badge-indigo">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      <td className="mac-td font-black text-black text-xs">
                        {formatCurrency(product.price)}
                      </td>

                      <td className="mac-td">
                        <span
                          className={`mac-badge ${
                            product.stock <= 5 ? 'mac-badge-amber' : 'mac-badge-emerald'
                          }`}
                        >
                          {product.stock} unit
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-black space-y-2">
              <Package className="w-10 h-10 mx-auto text-gray-600" />
              <p className="text-xs font-black uppercase">Tidak ada produk ditemukan</p>
              <p className="text-[11px] text-gray-700 font-semibold">Coba ubah kata kunci pencarian atau kategori filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
