import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Product } from '../types';
import { TableSkeleton } from '../components/common/Skeleton';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import {
  Truck,
  Search,
  MessageCircle,
  Boxes,
  Image as ImageIcon,
  AlertTriangle,
  PackageX,
  Building2,
  Banknote,
  Send,
} from 'lucide-react';
import { Supplier } from './SuppliersPage';

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    companyName: 'PT Fantech Indonesia Distribution',
    contactPerson: 'Bpk. Hendra Setyawan',
    phone: '081234567890',
    whatsapp: '6281234567890',
    email: 'sales@fantech.co.id',
    address: 'Kawasan Industri Mangga Dua Plaza Blok A No. 12, Jakarta Pusat',
    categorySupply: 'Komponen & Aksesoris PC',
    notes: 'Minimal order 10 unit per SKU. Diskon 5% untuk pembelian > Rp 5.000.000',
  },
  {
    id: 'sup-2',
    companyName: 'CV SteelSeries Jaya Tech',
    contactPerson: 'Ibu Rina Wijaya',
    phone: '081987654321',
    whatsapp: '6281987654321',
    email: 'orders@steelseries-distro.id',
    address: 'Ruko Dusit Mangga Dua No. 45, Jakarta Pusat',
    categorySupply: 'Komponen & Aksesoris PC',
    notes: 'Pengiriman H+1 setelah pembayaran (Transfer BCA).',
  },
  {
    id: 'sup-3',
    companyName: 'Distributor Anker & Powerbank Official',
    contactPerson: 'Bpk. Andi Kurniawan',
    phone: '085711223344',
    whatsapp: '6285711223344',
    email: 'supply@ankertech.co.id',
    address: 'Kawasan Harco Mangga Dua lantai 3 Blok B No. 88, Jakarta Pusat',
    categorySupply: 'Charger & Power',
    notes: 'Garansi resmi 18 bulan per unit.',
  },
  {
    id: 'sup-4',
    companyName: 'Maju Bersama Gadget Accessories',
    contactPerson: 'Ibu Maya Lestari',
    phone: '082199887766',
    whatsapp: '6282199887766',
    email: 'sales@majubersama-gadget.com',
    address: 'ITC Roxy Mas lantai 2 No. 102, Jakarta Barat',
    categorySupply: 'Aksesoris HP',
    notes: 'Spesialis Tempered Glass Privacy & Case MagSafe iPhone / Android.',
  },
];

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

  // Suppliers from localStorage or initial
  const [suppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('pos_suppliers_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SUPPLIERS;
      }
    }
    return INITIAL_SUPPLIERS;
  });

  // Selected supplier ID per product
  const [selectedSupplierMap, setSelectedSupplierMap] = useState<Record<string, string>>({});
  // Order Qty per product (default: 10)
  const [orderQtyMap, setOrderQtyMap] = useState<Record<string, number>>({});

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
      const prods = await api.getProducts(search);
      setProducts(prods);

      const initSupplierMap: Record<string, string> = { ...selectedSupplierMap };
      const initQtyMap: Record<string, number> = { ...orderQtyMap };

      prods.forEach((p: Product) => {
        if (!initQtyMap[p.id]) initQtyMap[p.id] = 10;
        if (!initSupplierMap[p.id]) {
          const catName = p.category?.name || '';
          const match = suppliers.find((s) =>
            s.categorySupply.toLowerCase().includes(catName.toLowerCase()) ||
            catName.toLowerCase().includes(s.categorySupply.toLowerCase())
          );
          initSupplierMap[p.id] = match ? match.id : suppliers[0]?.id || '';
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
    loadProducts();
  }, [search]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const getCostPrice = (prod: Product) => {
    return prod.costPrice && prod.costPrice > 0 ? prod.costPrice : Math.round(prod.price * 0.8);
  };

  const handleQtyChange = (productId: string, val: string) => {
    const qty = Math.max(1, parseInt(val) || 1);
    setOrderQtyMap((prev) => ({ ...prev, [productId]: qty }));
  };

  const handleSupplierChange = (productId: string, supplierId: string) => {
    setSelectedSupplierMap((prev) => ({ ...prev, [productId]: supplierId }));
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
        <div className="glass-card p-4.5 rounded-2xl border-slate-800 flex items-center gap-4 hover:border-emerald-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Supplier Terdaftar
            </span>
            <h3 className="text-xl font-extrabold text-white mt-0.5">{suppliers.length} <span className="text-xs font-semibold text-slate-400">Distributor</span></h3>
          </div>
        </div>

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

        <div className="glass-card p-4.5 rounded-2xl border-slate-800 flex items-center gap-4 hover:border-amber-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Gudang Menipis (≤ 5 Unit)
            </span>
            <h3 className="text-xl font-extrabold text-amber-400 mt-0.5">{lowWarehouseCount} <span className="text-xs font-semibold text-amber-400/80">Produk</span></h3>
          </div>
        </div>

        <div className="glass-card p-4.5 rounded-2xl border-slate-800 flex items-center gap-4 hover:border-cyan-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Estimasi Nilai Rencana Restock
            </span>
            <h3 className="text-xl font-extrabold text-cyan-400 mt-0.5">{formatCurrency(totalOrderValue)}</h3>
          </div>
        </div>
      </div>

      {/* Main Section Title & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" /> Order Pasokan Stok Ke Supplier
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pilih supplier tujuan, tentukan kapasitas stok yang ingin ditambah, dan hubungi supplier via WhatsApp 1-Klik.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari barang stok / SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="glass-card rounded-2xl overflow-hidden border-slate-800">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px] font-bold">
                <tr>
                  <th className="p-4">Foto & Nama Produk</th>
                  <th className="p-4">Supplier Tujuan</th>
                  <th className="p-4">Stok Gudang</th>
                  <th className="p-4">Harga Modal</th>
                  <th className="p-4 w-40 text-center">Tambah Stok (Qty)</th>
                  <th className="p-4">Total Bayar Supplier</th>
                  <th className="p-4 text-right">Aksi Order WA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((prod) => {
                  const isWarehouseOut = prod.warehouseStock <= 0;
                  const isWarehouseLow = prod.warehouseStock <= 5;
                  const costPrice = getCostPrice(prod);
                  const currentQty = orderQtyMap[prod.id] || 10;
                  const totalToPay = costPrice * currentQty;
                  const activeSupplierId = selectedSupplierMap[prod.id] || suppliers[0]?.id || '';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* FOTO & NAMA PRODUK */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden border border-slate-700/80 shrink-0">
                            <ProductImage src={prod.imageUrl} alt={prod.name} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 block text-xs">{prod.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{prod.sku} • {prod.category?.name || 'Uncategorized'}</span>
                          </div>
                        </div>
                      </td>

                      {/* SUPPLIER TUJUAN */}
                      <td className="p-4 min-w-[200px]">
                        <select
                          value={activeSupplierId}
                          onChange={(e) => handleSupplierChange(prod.id, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                        >
                          {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.companyName}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* STOK GUDANG */}
                      <td className="p-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all shadow-sm ${
                            isWarehouseOut
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : isWarehouseLow
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
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

                      {/* HARGA MODAL */}
                      <td className="p-4 font-mono text-slate-300 font-bold text-xs whitespace-nowrap">
                        {formatCurrency(costPrice)}
                      </td>

                      {/* INPUT QTY */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1 focus-within:border-emerald-500">
                          <input
                            type="number"
                            min="1"
                            value={currentQty}
                            onChange={(e) => handleQtyChange(prod.id, e.target.value)}
                            className="w-16 bg-transparent text-center text-xs font-mono font-extrabold text-emerald-400 focus:outline-none"
                          />
                          <span className="text-[10px] font-semibold text-slate-400 pr-1">Unit</span>
                        </div>
                      </td>

                      {/* TOTAL BAYAR */}
                      <td className="p-4 font-mono text-emerald-400 font-extrabold text-sm whitespace-nowrap">
                        {formatCurrency(totalToPay)}
                      </td>

                      {/* AKSI ORDER WA */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => directWhatsAppOrder(prod)}
                          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                          title="Hubungi Supplier & kirim pesan PO via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 fill-slate-950" /> Hubungi Supplier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Boxes className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-sm font-semibold">Tidak ada barang stok gudang ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
};
