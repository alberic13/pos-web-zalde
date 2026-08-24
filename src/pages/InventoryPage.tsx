import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Product, Category } from '../types';
import { TableSkeleton } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import {
  Warehouse,
  Search,
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
    <div className="space-y-5 animate-fade-in font-sans text-black">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Metrics Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Stok Etalase */}
        <div className="mac-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
              Stok Etalase Kasir
            </span>
            <h3 className="text-xl font-black text-black mt-0.5">{totalDisplayStock} <span className="text-xs font-bold text-gray-700">Unit</span></h3>
          </div>
        </div>

        {/* Stok Gudang */}
        <div className="mac-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
              Stok Cadangan Gudang
            </span>
            <h3 className="text-xl font-black text-black mt-0.5">{totalWarehouseStock} <span className="text-xs font-bold text-gray-700">Unit</span></h3>
          </div>
        </div>

        {/* Etalase Menipis Warning */}
        <div className="mac-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-red-700 font-bold shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
              Etalase Menipis (≤ 5 Unit)
            </span>
            <h3 className="text-xl font-black text-red-700 mt-0.5">{lowDisplayCount} <span className="text-xs font-bold text-gray-700">Produk</span></h3>
          </div>
        </div>

        {/* Total Asset Value */}
        <div className="mac-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
              Total Aset (Toko + Gudang)
            </span>
            <h3 className="text-base font-black text-black mt-0.5">{formatCurrency(totalAssetValue)}</h3>
          </div>
        </div>
      </div>

      {/* Header Actions & Filter Badges & Add Button */}
      <div className="mac-window p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari produk gudang / SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mac-input w-full pl-9 pr-4 py-1.5 text-xs font-semibold placeholder-gray-600 shadow-inner"
          />
        </div>

        {/* Status Filter Badges & Create Button */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`mac-btn px-3 py-1 text-xs whitespace-nowrap ${
                statusFilter === 'all' ? 'mac-btn-active' : ''
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('low_display')}
              className={`mac-btn px-3 py-1 text-xs whitespace-nowrap ${
                statusFilter === 'low_display' ? 'mac-btn-active' : ''
              }`}
            >
              ⚠️ Perlu Restock ({lowDisplayCount})
            </button>
            <button
              onClick={() => setStatusFilter('out_warehouse')}
              className={`mac-btn px-3 py-1 text-xs whitespace-nowrap ${
                statusFilter === 'out_warehouse' ? 'mac-btn-active' : ''
              }`}
            >
              📦 Gudang Kosong
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="mac-btn px-3.5 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Tambah Produk Baru
          </button>
        </div>
      </div>

      {/* Inventory & Display Stock Table Mac OS Window */}
      <div className="mac-window p-0 overflow-hidden">
        <div className="mac-window-header">
          <h3 className="text-xs font-black uppercase text-black">
            Manajemen Inventaris Stok Etalase Kasir & Gudang
          </h3>
        </div>

        <div className="p-3 bg-white">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={6} />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="mac-table">
                <thead>
                  <tr>
                    <th className="mac-th">Foto & Nama Produk</th>
                    <th className="mac-th">SKU</th>
                    <th className="mac-th">Stok Etalase</th>
                    <th className="mac-th">Stok Gudang</th>
                    <th className="mac-th">Harga Jual</th>
                    <th className="mac-th text-right">Aksi Management</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => {
                    const isDisplayLow = prod.stock <= 5;
                    const isWarehouseOut = prod.warehouseStock <= 0;

                    return (
                      <tr key={prod.id} className="mac-tr">
                        {/* PRODUCT & CATEGORY */}
                        <td className="mac-td">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 border border-black overflow-hidden shrink-0 flex items-center justify-center">
                              <ProductImage src={prod.imageUrl} alt={prod.name} />
                            </div>
                            <div>
                              <span className="font-extrabold text-black block text-xs">{prod.name}</span>
                              <span className="text-[10px] text-gray-700 font-semibold">{prod.category?.name || 'Uncategorized'}</span>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="mac-td font-mono font-bold text-xs">{prod.sku}</td>

                        {/* STOK ETALASE KASIR */}
                        <td className="mac-td whitespace-nowrap">
                          <span
                            className={`mac-badge ${
                              prod.stock <= 0
                                ? 'mac-badge-rose'
                                : isDisplayLow
                                ? 'mac-badge-amber'
                                : 'mac-badge-emerald'
                            }`}
                          >
                            <span>{prod.stock} Unit</span>
                            {isDisplayLow && <span className="ml-1">(Refill)</span>}
                          </span>
                        </td>

                        {/* STOK CADANGAN GUDANG */}
                        <td className="mac-td whitespace-nowrap">
                          <span
                            className={`mac-badge ${
                              isWarehouseOut ? 'mac-badge-rose' : 'mac-badge-indigo'
                            }`}
                          >
                            <span>{prod.warehouseStock} Unit</span>
                            {isWarehouseOut && <span className="ml-1">(Kosong)</span>}
                          </span>
                        </td>

                        {/* PRICE */}
                        <td className="mac-td font-black text-black text-xs">
                          {formatCurrency(prod.price)}
                        </td>

                        {/* ACTION BUTTONS GROUP */}
                        <td className="mac-td text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* PRIMARY ACTION: RESTOCK ETALASE */}
                            <button
                              onClick={() => {
                                setTransferProduct(prod);
                                setTransferAmount(prod.warehouseStock > 0 ? Math.min(10, prod.warehouseStock) : 1);
                                setIsTransferModalOpen(true);
                              }}
                              disabled={isWarehouseOut}
                              className="mac-btn px-2.5 py-1 text-[10px] font-black uppercase flex items-center gap-1 disabled:opacity-40"
                              title="Pindahkan stok dari Gudang ke Etalase Kasir"
                            >
                              <ArrowRightLeft className="w-3 h-3" /> Restock Etalase
                            </button>

                            {/* SECONDARY TOOLBAR GROUP */}
                            <button
                              onClick={() => {
                                setRestockProduct(prod);
                                setWarehouseRestockQty(10);
                                setIsWarehouseRestockOpen(true);
                              }}
                              className="mac-btn px-1.5 py-1 text-xs"
                              title="Tambah Pasokan Baru dari Supplier ke Gudang"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setViewingProduct(prod);
                                setIsDetailModalOpen(true);
                              }}
                              className="mac-btn px-1.5 py-1 text-xs"
                              title="Lihat Detail Produk"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => openEditModal(prod)}
                              className="mac-btn px-1.5 py-1 text-xs"
                              title="Edit Produk"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setDeletingProduct(prod);
                                setIsDeleteModalOpen(true);
                              }}
                              className="mac-btn px-1.5 py-1 text-xs text-red-700"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-black space-y-2">
              <Warehouse className="w-10 h-10 mx-auto text-gray-600" />
              <p className="text-xs font-black uppercase">Tidak ada produk ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL 1: RESTOCK ETALASE (TRANSFER GUDANG -> ETALASE) --- */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Restock Produk ke Etalase Kasir"
        subtitle={`Produk: ${transferProduct?.name}`}
      >
        {transferProduct && (
          <form onSubmit={handleTransferToDisplay} className="space-y-4 font-sans text-black">
            <div className="grid grid-cols-2 gap-3">
              <div className="mac-card p-3 text-center">
                <span className="text-[10px] text-gray-800 font-extrabold uppercase block mb-0.5">Sisa Stok Gudang</span>
                <span className="text-base font-black text-black font-mono">
                  {transferProduct.warehouseStock} Unit
                </span>
              </div>
              <div className="mac-card p-3 text-center">
                <span className="text-[10px] text-gray-800 font-extrabold uppercase block mb-0.5">Stok Etalase Saat Ini</span>
                <span className="text-base font-black text-black font-mono">
                  {transferProduct.stock} Unit
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-black block mb-1 uppercase">
                Jumlah Unit Diambil dari Gudang ➔ Etalase *
              </label>
              <input
                type="number"
                required
                min="1"
                max={transferProduct.warehouseStock}
                placeholder="Masukkan jumlah unit..."
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-extrabold"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || transferProduct.warehouseStock <= 0}
              className="mac-btn w-full py-2.5 text-xs font-black uppercase disabled:opacity-50 flex items-center justify-center gap-2"
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
        title="Tambah Pasokan Baru ke Gudang"
        subtitle={`Produk: ${restockProduct?.name}`}
      >
        {restockProduct && (
          <form onSubmit={handleRestockWarehouse} className="space-y-4 font-sans text-black">
            <div className="mac-card p-3 text-xs flex justify-between items-center font-bold">
              <span>Stok Cadangan Gudang Saat Ini:</span>
              <span className="font-mono font-black text-black text-sm">
                {restockProduct.warehouseStock} Unit
              </span>
            </div>

            <div>
              <label className="text-xs font-black text-black block mb-1 uppercase">
                Jumlah Unit Baru Masuk Gudang *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="Masukkan jumlah unit dari supplier..."
                value={warehouseRestockQty}
                onChange={(e) => setWarehouseRestockQty(e.target.value === '' ? '' : Number(e.target.value))}
                className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-extrabold"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mac-btn w-full py-2.5 text-xs font-black uppercase disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Boxes className="w-4 h-4" />
              {submitting ? 'Menyimpan...' : 'Simpan Pasokan Masuk Gudang'}
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
        <form onSubmit={handleSaveProduct} className="space-y-3.5 font-sans text-black">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-black block mb-1 uppercase">SKU Barang *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-bold"
                placeholder="PRD-123456"
              />
            </div>
            <div>
              <label className="text-xs font-black text-black block mb-1 uppercase">Kategori *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="mac-select w-full text-xs font-bold"
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
            <label className="text-xs font-black text-black block mb-1 uppercase">Nama Produk *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Mouse Gaming Wireless RGB..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mac-input w-full px-3 py-2 text-xs font-extrabold text-black"
            />
          </div>

          <div>
            <label className="text-xs font-black text-black block mb-1 uppercase">Harga Jual *</label>
            <input
              type="number"
              required
              min="0"
              placeholder="Rp 0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-extrabold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-black block mb-1 uppercase">Stok Etalase</label>
              <input
                type="number"
                required
                min="0"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-extrabold"
              />
            </div>

            <div>
              <label className="text-xs font-black text-black block mb-1 uppercase">Stok Gudang</label>
              <input
                type="number"
                required
                min="0"
                placeholder="0"
                value={formData.warehouseStock}
                onChange={(e) => setFormData({ ...formData, warehouseStock: e.target.value })}
                className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-extrabold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-black block mb-1 uppercase">URL Foto Produk (Opsional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="mac-input w-full px-3 py-2 text-xs text-black"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mac-btn w-full py-2.5 text-xs font-black uppercase disabled:opacity-50 flex items-center justify-center gap-2"
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
      >
        {deletingProduct && (
          <div className="space-y-4 font-sans text-black">
            <div className="p-3 bg-red-100 border-2 border-black flex items-center gap-3 text-xs font-extrabold">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-700" />
              <span>
                Produk <strong>"{deletingProduct.name}"</strong> akan dihapus permanen.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="mac-btn flex-1 py-2 text-xs font-black uppercase"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteProduct}
                className="mac-btn flex-1 py-2 text-xs font-black uppercase mac-btn-active text-white bg-red-700"
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
          <div className="space-y-3.5 text-xs font-sans text-black">
            <div className="flex gap-3.5 items-center mac-card p-3">
              <div className="w-14 h-14 bg-gray-200 border border-black overflow-hidden shrink-0 flex items-center justify-center">
                <ProductImage src={viewingProduct.imageUrl} alt={viewingProduct.name} />
              </div>
              <div>
                <h4 className="text-sm font-black text-black">{viewingProduct.name}</h4>
                <p className="text-xs font-bold text-gray-700 mt-0.5">{viewingProduct.category?.name || 'Kategori'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="mac-card p-3">
                <span className="text-[10px] text-gray-800 block uppercase font-black mb-1">Stok Etalase</span>
                <span className="text-base font-black text-black font-mono">{viewingProduct.stock} Unit</span>
              </div>
              <div className="mac-card p-3">
                <span className="text-[10px] text-gray-800 block uppercase font-black mb-1">Stok Gudang</span>
                <span className="text-base font-black text-black font-mono">{viewingProduct.warehouseStock} Unit</span>
              </div>
            </div>

            <div className="mac-card p-3">
              <span className="text-[10px] text-gray-800 block uppercase font-black mb-1">Harga Jual</span>
              <span className="text-base font-black text-black font-mono">
                {formatCurrency(viewingProduct.price)}
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openEditModal(viewingProduct);
                }}
                className="mac-btn px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" /> Edit Informasi Produk
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
