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
  PackageX,
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
    <div className="space-y-6 animate-fade-in">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Banner KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl flex items-center gap-4 hover:border-emerald-500/40 hover:shadow-xs transition-all shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Supplier Terdaftar
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{suppliers.length} <span className="text-xs font-semibold text-slate-500">Distributor</span></h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl flex items-center gap-4 hover:border-blue-500/40 hover:shadow-xs transition-all shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Stok Cadangan Gudang
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{totalWarehouseStock} <span className="text-xs font-semibold text-slate-500">Unit</span></h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl flex items-center gap-4 hover:border-amber-500/40 hover:shadow-xs transition-all shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Gudang Menipis (≤ 5 Unit)
            </span>
            <h3 className="text-xl font-extrabold text-amber-600 mt-0.5">{lowWarehouseCount} <span className="text-xs font-semibold text-amber-700/80">Produk</span></h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl flex items-center gap-4 hover:border-[#7a35ff]/40 hover:shadow-violet transition-all shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-[#f3eeff] flex items-center justify-center text-[#7a35ff] shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Estimasi Rencana Restock
            </span>
            <h3 className="text-xl font-extrabold text-[#7a35ff] mt-0.5">{formatCurrency(totalOrderValue)}</h3>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-[#7a35ff] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Produk ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'low'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚠️ Gudang Menipis ({lowWarehouseCount})
          </button>
          <button
            onClick={() => setFilterMode('empty')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'empty'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚫 Gudang Kosong
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari barang / SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-[#7a35ff] focus:ring-2 focus:ring-[#7a35ff]/20 transition-all font-medium"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 text-[11px] font-extrabold">
                <tr>
                  <th className="px-4 py-3.5">Foto & Nama Produk</th>
                  <th className="px-4 py-3.5">Supplier Tujuan</th>
                  <th className="px-4 py-3.5">Stok Gudang</th>
                  <th className="px-4 py-3.5">Harga Modal</th>
                  <th className="px-4 py-3.5">Harga Jual</th>
                  <th className="px-4 py-3.5 text-center min-w-[140px]">Tambah Qty</th>
                  <th className="px-4 py-3.5">Total Bayar</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => {
                  const isWarehouseOut = prod.warehouseStock <= 0;
                  const isWarehouseLow = prod.warehouseStock <= 5;
                  const costPrice = getCostPrice(prod);
                  const currentQty = orderQtyMap[prod.id] || 10;
                  const totalToPay = costPrice * currentQty;
                  const activeSupplierId = selectedSupplierMap[prod.id] || suppliers[0]?.id || '';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* FOTO & NAMA PRODUK */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                            <ProductImage src={prod.imageUrl} alt={prod.name} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs line-clamp-1">{prod.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{prod.sku} • {prod.category?.name || 'Kategori'}</span>
                          </div>
                        </div>
                      </td>

                      {/* SUPPLIER TUJUAN */}
                      <td className="px-4 py-3.5 min-w-[180px]">
                        <select
                          value={activeSupplierId}
                          onChange={(e) => handleSupplierChange(prod.id, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#7a35ff] font-semibold cursor-pointer shadow-2xs"
                        >
                          {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.companyName}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* STOK GUDANG */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                            isWarehouseOut
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isWarehouseLow
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {isWarehouseOut ? (
                            <PackageX className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                          ) : (
                            <Boxes className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                          )}
                          <span>{prod.warehouseStock} Unit</span>
                        </div>
                      </td>

                      {/* HARGA MODAL */}
                      <td className="px-4 py-3.5 font-mono text-slate-700 font-bold text-xs whitespace-nowrap">
                        {formatCurrency(costPrice)}
                      </td>

                      {/* HARGA JUAL */}
                      <td className="px-4 py-3.5 font-mono text-[#7a35ff] font-extrabold text-xs whitespace-nowrap">
                        {formatCurrency(prod.price)}
                      </td>

                      {/* INPUT QTY WITH STEPPER (+ / -) */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center bg-[#f0f2f5] border border-slate-200 rounded-xl p-1 gap-1">
                          <button
                            type="button"
                            onClick={() => updateQty(prod.id, -5)}
                            className="p-1 hover:bg-white text-slate-500 hover:text-slate-900 rounded-lg transition-colors shadow-2xs"
                            title="-5 Unit"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <input
                            type="number"
                            min="1"
                            value={currentQty}
                            onChange={(e) => setQtyDirect(prod.id, e.target.value)}
                            className="w-12 bg-transparent text-center text-xs font-mono font-extrabold text-[#7a35ff] focus:outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => updateQty(prod.id, 5)}
                            className="p-1 hover:bg-white text-slate-500 hover:text-slate-900 rounded-lg transition-colors shadow-2xs"
                            title="+5 Unit"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* TOTAL BAYAR */}
                      <td className="px-4 py-3.5 font-mono text-[#7a35ff] font-extrabold text-sm whitespace-nowrap">
                        {formatCurrency(totalToPay)}
                      </td>

                      {/* AKSI BUTTONS GROUP */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* EDIT HARGA MODAL */}
                          <button
                            onClick={() => openEditCostModal(prod)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all"
                            title="Edit Harga Modal (Beli) Produk Ini"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* ORDER WA */}
                          <button
                            onClick={() => directWhatsAppOrder(prod)}
                            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all"
                            title="Hubungi Supplier & kirim PO via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4 fill-white" />
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
          <div className="text-center py-16 text-slate-500 space-y-2">
            <Boxes className="w-12 h-12 mx-auto opacity-40" />
            <p className="text-sm font-semibold">Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>

      {/* --- MODAL EDIT HARGA MODAL (BELI) --- */}
      <Modal
        isOpen={isEditCostModalOpen}
        onClose={() => setIsEditCostModalOpen(false)}
        title="Edit Harga Modal (Beli) Produk"
        subtitle={`Produk: ${costProduct?.name}`}
      >
        {costProduct && (
          <form onSubmit={handleSaveCostPrice} className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Harga Jual Etalase</span>
              <span className="text-sm font-extrabold text-[#7a35ff] font-mono">{formatCurrency(costProduct.price)}</span>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Harga Modal Baru (Rp) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="Masukkan harga modal beli..."
                value={newCostPrice}
                onChange={(e) => setNewCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#f0f2f5] border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 font-extrabold focus:outline-none focus:border-[#7a35ff]"
              />
            </div>

            {newCostPrice !== '' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500">Estimasi Margin Keuntungan / Unit:</span>
                <span className="font-mono font-extrabold text-[#7a35ff] text-sm">
                  {formatCurrency(costProduct.price - Number(newCostPrice))}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingCost}
              className="w-full py-3 bg-[#7a35ff] hover:bg-[#6825e6] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#7a35ff]/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> {submittingCost ? 'Menyimpan...' : 'Simpan Harga Modal Baru'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
