import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Product, Category } from '../types';
import { TableSkeleton } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import {
  Warehouse,
  Search,
  PackageX,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Image as ImageIcon,
  Boxes,
  Banknote,
  ArrowRightLeft,
  Store,
  Save,
  Layers,
} from 'lucide-react';

const ProductImage: React.FC<{ src?: string | null; alt: string; className?: string }> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
}) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
        <ImageIcon className="w-4 h-4" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

export const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low_display' | 'out_warehouse' | 'safe'>('all');

  // --- MODAL STATES ---
  // 1. Transfer Gudang -> Etalase Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferProduct, setTransferProduct] = useState<Product | null>(null);
  const [transferAmount, setTransferAmount] = useState<number | ''>(5);

  // 2. Pasokan Gudang Baru Modal
  const [isWarehouseRestockOpen, setIsWarehouseRestockOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [warehouseRestockQty, setWarehouseRestockQty] = useState<number | ''>(10);

  // 3. Create & Edit Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
    costPrice: '',
    stock: '',
    warehouseStock: '',
    categoryId: '',
    imageUrl: '',
  });

  // 4. Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // 5. Detail View Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        api.getProducts(search),
        api.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      addToast('error', 'Gagal memuat data gudang', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Generate unique SKU
  const generateSku = () => {
    return `PRD-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  // --- ACTION 1: Transfer Stok Gudang ke Etalase Kasir ---
  const handleTransferToDisplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProduct || transferAmount === '') return;

    const amount = Number(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast('error', 'Jumlah Tidak Valid', 'Masukkan angka transfer yang valid.');
      return;
    }

    if (amount > transferProduct.warehouseStock) {
      addToast(
        'error',
        'Stok Gudang Tidak Cukup',
        `Sisa stok di gudang hanya ${transferProduct.warehouseStock} unit.`
      );
      return;
    }

    try {
      setSubmitting(true);
      await api.transferToDisplay(transferProduct.id, amount);
      addToast(
        'success',
        'Restock Etalase Berhasil!',
        `${amount} unit "${transferProduct.name}" berhasil dipindahkan dari Gudang ke Etalase Kasir.`
      );
      setIsTransferModalOpen(false);
      loadData();
    } catch (err: any) {
      addToast('error', 'Gagal Memindahkan Stok', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- ACTION 2: Tambah Pasokan Masuk ke Gudang ---
  const handleRestockWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct || warehouseRestockQty === '') return;

    const qty = Number(warehouseRestockQty);
    if (isNaN(qty) || qty <= 0) {
      addToast('error', 'Jumlah Tidak Valid', 'Masukkan angka pasokan yang valid.');
      return;
    }

    try {
      setSubmitting(true);
      const newWarehouseStock = restockProduct.warehouseStock + qty;
      await api.updateProduct(restockProduct.id, {
        sku: restockProduct.sku,
        name: restockProduct.name,
        price: restockProduct.price,
        costPrice: restockProduct.costPrice || undefined,
        stock: restockProduct.stock,
        warehouseStock: newWarehouseStock,
        categoryId: restockProduct.categoryId,
        imageUrl: restockProduct.imageUrl || undefined,
      });

      addToast(
        'success',
        'Pasokan Gudang Bertambah!',
        `Stok cadangan gudang "${restockProduct.name}" bertambah +${qty} unit.`
      );
      setIsWarehouseRestockOpen(false);
      loadData();
    } catch (err: any) {
      addToast('error', 'Gagal Menambah Pasokan Gudang', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- ACTION 3: Create / Edit Product ---
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: generateSku(),
      name: '',
      price: '',
      costPrice: '',
      stock: '5',
      warehouseStock: '20',
      categoryId: categories[0]?.id || '',
      imageUrl: '',
    });
    setIsProductModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      price: prod.price.toString(),
      costPrice: prod.costPrice ? prod.costPrice.toString() : '',
      stock: prod.stock.toString(),
      warehouseStock: prod.warehouseStock.toString(),
      categoryId: prod.categoryId,
      imageUrl: prod.imageUrl || '',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      addToast('error', 'Form Tidak Lengkap', 'Harap isi Nama, Harga Jual, dan Kategori.');
      return;
    }

    const payload = {
      sku: formData.sku.trim() || generateSku(),
      name: formData.name.trim(),
      price: Number(formData.price),
      costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
      stock: Number(formData.stock || 0),
      warehouseStock: Number(formData.warehouseStock || 0),
      categoryId: formData.categoryId,
      imageUrl: formData.imageUrl.trim() || undefined,
    };

    try {
      setSubmitting(true);
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        addToast('success', 'Produk Diperbarui!', `Produk "${payload.name}" berhasil diupdate.`);
      } else {
        await api.createProduct(payload);
        addToast('success', 'Produk Ditambahkan!', `Produk baru "${payload.name}" berhasil ditambahkan.`);
      }
      setIsProductModalOpen(false);
      loadData();
    } catch (err: any) {
      addToast('error', 'Gagal Menyimpan Produk', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- ACTION 4: Delete Product ---
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      setSubmitting(true);
      await api.deleteProduct(deletingProduct.id);
      addToast('success', 'Produk Dihapus!', `Produk "${deletingProduct.name}" telah dihapus.`);
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
      loadData();
    } catch (err: any) {
      addToast('error', 'Gagal Menghapus Produk', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products by status & search
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'low_display') return p.stock <= 5;
    if (statusFilter === 'out_warehouse') return p.warehouseStock <= 0;
    if (statusFilter === 'safe') return p.stock > 5 && p.warehouseStock > 5;
    return true; // 'all'
  });

  // Calculate Metrics
  const totalDisplayStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalWarehouseStock = products.reduce((sum, p) => sum + p.warehouseStock, 0);
  const lowDisplayCount = products.filter((p) => p.stock <= 5).length;
  const totalAssetValue = products.reduce(
    (sum, p) => sum + p.price * (p.stock + p.warehouseStock),
    0
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-fade-in">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Metrics Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Stok Etalase */}
        <div className="glass-card p-4.5 rounded-2xl border-slate-800 flex items-center gap-4 hover:border-cyan-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Stok Etalase Kasir
            </span>
            <h3 className="text-xl font-extrabold text-white mt-0.5">{totalDisplayStock} <span className="text-xs font-semibold text-slate-400">Unit</span></h3>
          </div>
        </div>

        {/* Stok Gudang */}
        <div className="glass-card p-4.5 rounded-2xl border-slate-800 flex items-center gap-4 hover:border-blue-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Stok Cadangan Gudang
            </span>
            <h3 className="text-xl font-extrabold text-white mt-0.5">{totalWarehouseStock} <span className="text-xs font-semibold text-slate-400">Unit</span></h3>
          </div>
        </div>

        {/* Etalase Menipis Warning */}
        <div className="glass-card p-4.5 rounded-2xl border-slate-800 flex items-center gap-4 hover:border-amber-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Etalase Menipis (≤ 5 Unit)
            </span>
            <h3 className="text-xl font-extrabold text-amber-400 mt-0.5">{lowDisplayCount} <span className="text-xs font-semibold text-amber-400/80">Produk</span></h3>
          </div>
        </div>

        {/* Total Asset Value */}
        <div className="glass-card p-4.5 rounded-2xl border-slate-800 flex items-center gap-4 hover:border-emerald-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Aset (Toko + Gudang)
            </span>
            <h3 className="text-xl font-extrabold text-emerald-400 mt-0.5">{formatCurrency(totalAssetValue)}</h3>
          </div>
        </div>
      </div>

      {/* Header Actions & Filter Badges & Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari produk gudang / SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Status Filter Badges & Create Button */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('low_display')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'low_display'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚠️ Perlu Restock ({lowDisplayCount})
            </button>
            <button
              onClick={() => setStatusFilter('out_warehouse')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'out_warehouse'
                  ? 'bg-rose-500 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📦 Gudang Kosong
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0 ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" /> Tambah Produk Baru
          </button>
        </div>
      </div>

      {/* Inventory & Display Stock Table */}
      <div className="glass-card rounded-2xl overflow-hidden border-slate-800">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px] font-bold">
                <tr>
                  <th className="p-4">Foto & Nama Produk</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Stok Etalase</th>
                  <th className="p-4">Stok Gudang</th>
                  <th className="p-4">Harga Jual</th>
                  <th className="p-4 text-right">Aksi Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((prod) => {
                  const isDisplayLow = prod.stock <= 5;
                  const isWarehouseOut = prod.warehouseStock <= 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* PRODUCT & CATEGORY */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden border border-slate-700/80 shrink-0">
                            <ProductImage src={prod.imageUrl} alt={prod.name} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 block text-xs">{prod.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{prod.category?.name || 'Uncategorized'}</span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-4 font-mono text-slate-400 text-xs">{prod.sku}</td>

                      {/* STOK ETALASE KASIR */}
                      <td className="p-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all shadow-sm ${
                            prod.stock <= 0
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : isDisplayLow
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {prod.stock <= 0 ? (
                            <PackageX className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                          ) : isDisplayLow ? (
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400 animate-pulse" />
                          ) : (
                            <Store className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                          )}
                          <span>{prod.stock} Unit</span>
                          {isDisplayLow && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-[10px] font-black uppercase tracking-wider text-amber-300">
                              Refill
                            </span>
                          )}
                        </div>
                      </td>

                      {/* STOK CADANGAN GUDANG */}
                      <td className="p-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all shadow-sm ${
                            isWarehouseOut
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                          }`}
                        >
                          {isWarehouseOut ? (
                            <PackageX className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                          ) : (
                            <Boxes className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                          )}
                          <span>{prod.warehouseStock} Unit</span>
                          {isWarehouseOut && (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-[10px] font-black uppercase tracking-wider text-rose-300">
                              Kosong
                            </span>
                          )}
                        </div>
                      </td>

                      {/* PRICE */}
                      <td className="p-4 font-extrabold text-emerald-400 font-mono text-xs">
                        {formatCurrency(prod.price)}
                      </td>

                      {/* ACTION BUTTONS GROUP */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* PRIMARY ACTION: RESTOCK ETALASE */}
                          <button
                            onClick={() => {
                              setTransferProduct(prod);
                              setTransferAmount(prod.warehouseStock > 0 ? Math.min(10, prod.warehouseStock) : 1);
                              setIsTransferModalOpen(true);
                            }}
                            disabled={isWarehouseOut}
                            className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 border transition-all whitespace-nowrap ${
                              isDisplayLow
                                ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 shadow-md shadow-amber-500/20'
                                : 'bg-slate-800/90 text-emerald-400 border-slate-700 hover:bg-slate-700'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title="Pindahkan stok dari Gudang ke Etalase Kasir"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" /> Restock Etalase
                          </button>

                          {/* SECONDARY TOOLBAR GROUP */}
                          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/90">
                            {/* PASOKAN GUDANG BARU */}
                            <button
                              onClick={() => {
                                setRestockProduct(prod);
                                setWarehouseRestockQty(10);
                                setIsWarehouseRestockOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Tambah Pasokan Baru dari Supplier ke Gudang"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            {/* DETAIL */}
                            <button
                              onClick={() => {
                                setViewingProduct(prod);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Lihat Detail Produk"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* EDIT */}
                            <button
                              onClick={() => openEditModal(prod)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Produk"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* DELETE */}
                            <button
                              onClick={() => {
                                setDeletingProduct(prod);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Warehouse className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-sm font-semibold">Tidak ada produk ditemukan</p>
            <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau tambah barang baru.</p>
          </div>
        )}
      </div>

      {/* --- MODAL 1: RESTOCK ETALASE (TRANSFER GUDANG -> ETALASE) --- */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Restock Produk ke Etalase Kasir"
        subtitle={`Produk: ${transferProduct?.name}`}
      >
        {transferProduct && (
          <form onSubmit={handleTransferToDisplay} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-center">
                <span className="text-[10px] text-blue-300 font-semibold uppercase block">Sisa Stok Gudang</span>
                <span className="text-lg font-extrabold text-blue-400 font-mono">
                  {transferProduct.warehouseStock} Unit
                </span>
              </div>
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center">
                <span className="text-[10px] text-emerald-300 font-semibold uppercase block">Stok Etalase Saat Ini</span>
                <span className="text-lg font-extrabold text-emerald-400 font-mono">
                  {transferProduct.stock} Unit
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Jumlah Unit yang Diambil dari Gudang ➔ Dipajang di Etalase *
              </label>
              <input
                type="number"
                required
                min="1"
                max={transferProduct.warehouseStock}
                placeholder="Masukkan jumlah unit..."
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 font-extrabold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {transferAmount !== '' && (
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Stok Gudang Setelah Dipindah:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {Math.max(0, transferProduct.warehouseStock - Number(transferAmount))} Unit
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Stok Etalase Kasir Terbaru:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {transferProduct.stock + Number(transferAmount)} Unit
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || transferProduct.warehouseStock <= 0}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              {submitting ? 'Memindahkan Stok...' : 'Konfirmasi Restock Ke Etalase'}
            </button>
          </form>
        )}
      </Modal>

      {/* --- MODAL 2: PASOKAN GUDANG BARU --- */}
      <Modal
        isOpen={isWarehouseRestockOpen}
        onClose={() => setIsWarehouseRestockOpen(false)}
        title="Tambah Pasokan Baru ke Gudang (Supplier)"
        subtitle={`Produk: ${restockProduct?.name}`}
      >
        {restockProduct && (
          <form onSubmit={handleRestockWarehouse} className="space-y-4">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
              <span className="text-slate-400">Stok Cadangan Gudang Saat Ini:</span>
              <span className="font-mono font-extrabold text-blue-400 text-sm">
                {restockProduct.warehouseStock} Unit
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Jumlah Unit Baru yang Masuk ke Gudang *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="Masukkan jumlah unit dari supplier..."
                value={warehouseRestockQty}
                onChange={(e) => setWarehouseRestockQty(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-blue-400 font-extrabold focus:outline-none focus:border-blue-500"
              />
            </div>

            {warehouseRestockQty !== '' && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                <span className="text-slate-400">Stok Gudang Setelah Tambah:</span>
                <span className="font-mono font-extrabold text-blue-300 text-sm">
                  {restockProduct.warehouseStock + Number(warehouseRestockQty)} Unit
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Boxes className="w-4 h-4" />
              {submitting ? 'Menyimpan Pasokan...' : 'Simpan Pasokan Masuk Gudang'}
            </button>
          </form>
        )}
      </Modal>

      {/* --- MODAL 3: CREATE / EDIT PRODUCT --- */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
        subtitle={editingProduct ? `SKU: ${editingProduct.sku}` : 'Lengkapi detail produk etalase dan stok gudang'}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">SKU Barang *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                placeholder="PRD-123456"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Kategori Produk *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="" disabled>Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Produk *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Mouse Gaming Wireless RGB..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Harga Jual Produk *</label>
            <input
              type="number"
              required
              min="0"
              placeholder="Rp 0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">🏪 Stok Etalase Kasir</label>
              <input
                type="number"
                required
                min="0"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">📦 Stok Cadangan Gudang</label>
              <input
                type="number"
                required
                min="0"
                placeholder="0"
                value={formData.warehouseStock}
                onChange={(e) => setFormData({ ...formData, warehouseStock: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-blue-400 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">URL Foto Produk (Opsional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> {submitting ? 'Menyimpan...' : editingProduct ? 'Simpan Perubahan' : 'Tambah Produk Sekarang'}
          </button>
        </form>
      </Modal>

      {/* --- MODAL 4: CONFIRM DELETE --- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Produk"
        subtitle={`Apakah Anda yakin ingin menghapus produk ini?`}
      >
        {deletingProduct && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-300 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                Tindakan ini tidak dapat dibatalkan. Produk <strong>"{deletingProduct.name}"</strong> akan dihapus permanen.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteProduct}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
              >
                {submitting ? 'Menghapus...' : 'Ya, Hapus Produk'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* --- MODAL 5: DETAIL PRODUCT VIEW --- */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Stok & Produk"
        subtitle={`SKU: ${viewingProduct?.sku}`}
      >
        {viewingProduct && (
          <div className="space-y-4 text-xs">
            <div className="flex gap-4 items-center p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden border border-slate-700 shrink-0">
                <ProductImage src={viewingProduct.imageUrl} alt={viewingProduct.name} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{viewingProduct.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{viewingProduct.category?.name || 'Kategori'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/20">
                <span className="text-[10px] text-emerald-300 block uppercase font-semibold">🏪 Stok Etalase (Kasir)</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">{viewingProduct.stock} Unit</span>
              </div>
              <div className="p-3 bg-blue-950/30 rounded-xl border border-blue-500/20">
                <span className="text-[10px] text-blue-300 block uppercase font-semibold">📦 Stok Cadangan Gudang</span>
                <span className="text-base font-extrabold text-blue-400 font-mono">{viewingProduct.warehouseStock} Unit</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Harga Jual Produk (Etalase)</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {formatCurrency(viewingProduct.price)}
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Total Nilai Produk Ini (Toko + Gudang)</span>
              <span className="text-base font-extrabold text-cyan-400 font-mono">
                {formatCurrency(viewingProduct.price * (viewingProduct.stock + viewingProduct.warehouseStock))}
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openEditModal(viewingProduct);
                }}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Informasi Produk
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
