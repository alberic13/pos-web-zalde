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
      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
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
    <div className="space-y-6 animate-fade-in">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table Container */}
      <div className="glass-card rounded-2xl overflow-hidden border-slate-800">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px] font-bold">
                <tr>
                  <th className="p-4">Produk</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Harga Jual</th>
                  <th className="p-4">Stok Etalase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden border border-slate-700/80 shrink-0">
                          <ProductImage src={product.imageUrl} alt={product.name} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-100 block text-xs">{product.name}</span>
                          <span className="text-[10px] text-slate-400">Kasir Etalase</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-400 text-xs">{product.sku}</td>

                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>

                    <td className="p-4 font-extrabold text-emerald-400 font-mono text-xs">
                      {formatCurrency(product.price)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          product.stock <= 5
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
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
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Package className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-sm font-semibold">Tidak ada produk ditemukan</p>
            <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau kategori filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
