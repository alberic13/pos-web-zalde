import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Product } from '../types';
import { TableSkeleton } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import {
  Search,
  MessageCircle,
  Boxes,
  Image as ImageIcon,
  AlertTriangle,
  Building2,
  Banknote,
  Minus,
  Plus,
  Edit3,
  Save,
} from 'lucide-react';
import { Supplier } from './SuppliersPage';

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

export const SupplierOrdersPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'empty'>('all');

  // Modal State for Editing Cost Price (Harga Modal)
  const [isEditCostModalOpen, setIsEditCostModalOpen] = useState(false);
  const [costProduct, setCostProduct] = useState<Product | null>(null);
  const [newCostPrice, setNewCostPrice] = useState<number | ''>('');
  const [submittingCost, setSubmittingCost] = useState(false);

  // Suppliers from Database API
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierMap, setSelectedSupplierMap] = useState<Record<string, string>>({});
  const [orderQtyMap, setOrderQtyMap] = useState<Record<string, number>>({});

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
      const [prods, sups] = await Promise.all([api.getProducts(search), api.getSuppliers()]);
      setProducts(prods);
      setSuppliers(sups);

      const initSupplierMap: Record<string, string> = { ...selectedSupplierMap };
      const initQtyMap: Record<string, number> = { ...orderQtyMap };

      prods.forEach((p: Product) => {
        if (!initQtyMap[p.id]) initQtyMap[p.id] = 10;
        if (!initSupplierMap[p.id]) {
          const catName = p.category?.name || '';
          const match = sups.find((s: Supplier) =>
            s.categorySupply.toLowerCase().includes(catName.toLowerCase()) ||
            catName.toLowerCase().includes(s.categorySupply.toLowerCase())
          );
          initSupplierMap[p.id] = match ? match.id : sups[0]?.id || '';
        }
      });

      setSelectedSupplierMap(initSupplierMap);
      setOrderQtyMap(initQtyMap);
    } catch (err: any) {
      addToast('error', 'Gagal memuat data produk stok gudang', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const getCostPrice = (prod: Product) => {
    return prod.costPrice && prod.costPrice > 0 ? prod.costPrice : Math.round(prod.price * 0.8);
  };

  const updateQty = (productId: string, delta: number) => {
    setOrderQtyMap((prev) => {
      const current = prev[productId] || 10;
      const nextVal = Math.max(1, current + delta);
      return { ...prev, [productId]: nextVal };
    });
  };

  const setQtyDirect = (productId: string, val: string) => {
    const qty = Math.max(1, parseInt(val) || 1);
    setOrderQtyMap((prev) => ({ ...prev, [productId]: qty }));
  };

  const handleSupplierChange = (productId: string, supplierId: string) => {
    setSelectedSupplierMap((prev) => ({ ...prev, [productId]: supplierId }));
  };

  // Open Edit Cost Price Modal
  const openEditCostModal = (prod: Product) => {
    setCostProduct(prod);
    setNewCostPrice(getCostPrice(prod));
    setIsEditCostModalOpen(true);
  };

  // Save Cost Price to Database
  const handleSaveCostPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!costProduct || newCostPrice === '') return;

    const val = Number(newCostPrice);
    if (isNaN(val) || val < 0) {
      addToast('error', 'Harga Modal Tidak Valid', 'Masukkan angka harga modal yang valid.');
      return;
    }

    try {
      setSubmittingCost(true);
      await api.updateProduct(costProduct.id, {
        sku: costProduct.sku,
        name: costProduct.name,
        price: costProduct.price,
        costPrice: val,
        stock: costProduct.stock,
        warehouseStock: costProduct.warehouseStock,
        categoryId: costProduct.categoryId,
        imageUrl: costProduct.imageUrl || undefined,
      });

      addToast('success', 'Harga Modal Diperbarui!', `Harga modal untuk "${costProduct.name}" berhasil diset ke ${formatCurrency(val)}.`);
      setIsEditCostModalOpen(false);
      loadData();
    } catch (err: any) {
      addToast('error', 'Gagal Memperbarui Harga Modal', err.message);
    } finally {
      setSubmittingCost(false);
    }
  };

  const directWhatsAppOrder = (prod: Product) => {
    const supplierId = selectedSupplierMap[prod.id] || suppliers[0]?.id;
    const supplier = suppliers.find((s) => s.id === supplierId);

    if (!supplier) {
      addToast('error', 'Pilih Supplier', 'Harap pilih supplier untuk barang ini.');
      return;
    }

    const qty = orderQtyMap[prod.id] || 10;
    const costPrice = getCostPrice(prod);
    const totalAmount = costPrice * qty;

    const waNumber = supplier.whatsapp.replace(/\D/g, '');
    const cleanWa = waNumber.startsWith('0') ? '62' + waNumber.slice(1) : waNumber.startsWith('62') ? waNumber : '62' + waNumber;

    const messageText =
      `*ORDER STOK BARANG (PURCHASE ORDER)* 📦\n` +
      `-----------------------------------------\n` +
      `Kepada Yth: *${supplier.companyName}*\n` +
      `Attn: *${supplier.contactPerson}*\n\n` +
      `Halo, kami dari *POS ZALDE STORE* ingin memesan pasokan stok barang berikut:\n\n` +
      `🔹 *Produk:* ${prod.name}\n` +
      `🔹 *SKU:* ${prod.sku}\n` +
      `🔹 *Jumlah Pesanan:* ${qty} Unit\n` +
      `🔹 *Harga Modal:* ${formatCurrency(costPrice)} / unit\n` +
      `🔹 *Harga Jual Etalase:* ${formatCurrency(prod.price)} / unit\n` +
      `💰 *Total Pembayaran:* ${formatCurrency(totalAmount)}\n\n` +
      `-----------------------------------------\n` +
      `Mohon konfirmasi ketersediaan stok & nomor rekening pembayaran.\n` +
      `Terima kasih! 🙏`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(messageText)}`, '_blank');

    addToast(
      'success',
      'Membuka WhatsApp...',
      `Pesan order ${qty} unit "${prod.name}" disiapkan untuk ${supplier.companyName}.`
    );
  };

  const filteredProducts = products.filter((p) => {
    if (filterMode === 'low') return p.warehouseStock <= 5;
    if (filterMode === 'empty') return p.warehouseStock <= 0;
    return true;
  });

  const totalWarehouseStock = products.reduce((sum, p) => sum + p.warehouseStock, 0);
  const lowWarehouseCount = products.filter((p) => p.warehouseStock <= 5).length;
  const totalOrderValue = products.reduce((sum, p) => {
    const qty = orderQtyMap[p.id] || 10;
    const cost = getCostPrice(p);
    return sum + qty * cost;
  }, 0);

  return (
    <div className="space-y-5 animate-fade-in font-sans text-black">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Banner KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="mac-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
              Supplier Terdaftar
            </span>
            <h3 className="text-xl font-black text-black mt-0.5">{suppliers.length} <span className="text-xs font-bold text-gray-700">Distributor</span></h3>
          </div>
        </div>

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

        <div className="mac-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-red-700 font-bold shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
              Gudang Menipis (≤ 5 Unit)
            </span>
            <h3 className="text-xl font-black text-red-700 mt-0.5">{lowWarehouseCount} <span className="text-xs font-bold text-gray-700">Produk</span></h3>
          </div>
        </div>

        <div className="mac-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
              Estimasi Rencana Restock
            </span>
            <h3 className="text-base font-black text-black mt-0.5">{formatCurrency(totalOrderValue)}</h3>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search Header Mac OS Window */}
      <div className="mac-window p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Badges */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`mac-btn px-3 py-1 text-xs font-bold whitespace-nowrap ${
              filterMode === 'all' ? 'mac-btn-active' : ''
            }`}
          >
            Semua Produk ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('low')}
            className={`mac-btn px-3 py-1 text-xs font-bold whitespace-nowrap ${
              filterMode === 'low' ? 'mac-btn-active' : ''
            }`}
          >
            ⚠️ Gudang Menipis ({lowWarehouseCount})
          </button>
          <button
            onClick={() => setFilterMode('empty')}
            className={`mac-btn px-3 py-1 text-xs font-bold whitespace-nowrap ${
              filterMode === 'empty' ? 'mac-btn-active' : ''
            }`}
          >
            🚫 Gudang Kosong
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari barang / SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mac-input w-full pl-9 pr-4 py-1.5 text-xs font-semibold placeholder-gray-600 shadow-inner"
          />
        </div>
      </div>

      {/* TABLE Mac OS Window */}
      <div className="mac-window p-0 overflow-hidden">
        <div className="mac-window-header">
          <h3 className="text-xs font-black uppercase text-black">
            Daftar Restock Barang ke Supplier (Purchase Order)
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
                    <th className="mac-th">Supplier Tujuan</th>
                    <th className="mac-th">Stok Gudang</th>
                    <th className="mac-th">Harga Modal</th>
                    <th className="mac-th">Harga Jual</th>
                    <th className="mac-th text-center min-w-[120px]">Tambah Qty</th>
                    <th className="mac-th">Total Bayar</th>
                    <th className="mac-th text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => {
                    const isWarehouseOut = prod.warehouseStock <= 0;
                    const isWarehouseLow = prod.warehouseStock <= 5;
                    const costPrice = getCostPrice(prod);
                    const currentQty = orderQtyMap[prod.id] || 10;
                    const totalToPay = costPrice * currentQty;
                    const activeSupplierId = selectedSupplierMap[prod.id] || suppliers[0]?.id || '';

                    return (
                      <tr key={prod.id} className="mac-tr">
                        {/* FOTO & NAMA PRODUK */}
                        <td className="mac-td">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 border border-black overflow-hidden shrink-0 flex items-center justify-center">
                              <ProductImage src={prod.imageUrl} alt={prod.name} />
                            </div>
                            <div>
                              <span className="font-extrabold text-black block text-xs line-clamp-1">{prod.name}</span>
                              <span className="text-[10px] text-gray-700 font-mono">{prod.sku} • {prod.category?.name || 'Kategori'}</span>
                            </div>
                          </div>
                        </td>

                        {/* SUPPLIER TUJUAN */}
                        <td className="mac-td min-w-[180px]">
                          <select
                            value={activeSupplierId}
                            onChange={(e) => handleSupplierChange(prod.id, e.target.value)}
                            className="mac-select w-full text-xs font-bold"
                          >
                            {suppliers.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.companyName}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* STOK GUDANG */}
                        <td className="mac-td whitespace-nowrap">
                          <span
                            className={`mac-badge ${
                              isWarehouseOut
                                ? 'mac-badge-rose'
                                : isWarehouseLow
                                ? 'mac-badge-amber'
                                : 'mac-badge-indigo'
                            }`}
                          >
                            <span>{prod.warehouseStock} Unit</span>
                          </span>
                        </td>

                        {/* HARGA MODAL */}
                        <td className="mac-td font-mono text-black font-bold text-xs whitespace-nowrap">
                          {formatCurrency(costPrice)}
                        </td>

                        {/* HARGA JUAL */}
                        <td className="mac-td font-mono text-black font-black text-xs whitespace-nowrap">
                          {formatCurrency(prod.price)}
                        </td>

                        {/* INPUT QTY WITH STEPPER (+ / -) */}
                        <td className="mac-td text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateQty(prod.id, -5)}
                              className="mac-btn px-1.5 py-0.5 text-xs font-black"
                              title="-5 Unit"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <input
                              type="number"
                              min="1"
                              value={currentQty}
                              onChange={(e) => setQtyDirect(prod.id, e.target.value)}
                              className="mac-input w-12 text-center text-xs font-mono font-black text-black py-0.5"
                            />

                            <button
                              type="button"
                              onClick={() => updateQty(prod.id, 5)}
                              className="mac-btn px-1.5 py-0.5 text-xs font-black"
                              title="+5 Unit"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* TOTAL BAYAR */}
                        <td className="mac-td font-mono text-black font-black text-xs whitespace-nowrap">
                          {formatCurrency(totalToPay)}
                        </td>

                        {/* AKSI BUTTONS GROUP */}
                        <td className="mac-td text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {/* EDIT HARGA MODAL */}
                            <button
                              onClick={() => openEditCostModal(prod)}
                              className="mac-btn px-2 py-1 text-xs"
                              title="Edit Harga Modal (Beli) Produk Ini"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* ORDER WA */}
                            <button
                              onClick={() => directWhatsAppOrder(prod)}
                              className="mac-btn px-2.5 py-1 text-[10px] font-black uppercase flex items-center gap-1"
                              title="Hubungi Supplier & kirim PO via WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700" /> Order WA
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
              <Boxes className="w-10 h-10 mx-auto text-gray-600" />
              <p className="text-xs font-black uppercase">Tidak ada produk ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL EDIT HARGA MODAL (BELI) --- */}
      <Modal
        isOpen={isEditCostModalOpen}
        onClose={() => setIsEditCostModalOpen(false)}
        title="Edit Harga Modal Produk"
        subtitle={`Produk: ${costProduct?.name}`}
      >
        {costProduct && (
          <form onSubmit={handleSaveCostPrice} className="space-y-3.5 text-xs font-sans text-black">
            <div className="mac-card p-3 space-y-1">
              <span className="text-[10px] text-gray-800 uppercase font-black block">Harga Jual Etalase</span>
              <span className="text-sm font-black text-black font-mono">{formatCurrency(costProduct.price)}</span>
            </div>

            <div>
              <label className="text-black font-black block mb-1 uppercase">
                Harga Modal Baru (Rp) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="Masukkan harga modal beli..."
                value={newCostPrice}
                onChange={(e) => setNewCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-extrabold"
              />
            </div>

            <button
              type="submit"
              disabled={submittingCost}
              className="mac-btn w-full py-2.5 text-xs font-black uppercase disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> {submittingCost ? 'Menyimpan...' : 'Simpan Harga Modal Baru'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
