import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Order } from '../types';
import { TableSkeleton } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import {
  Search,
  Eye,
  History,
  Printer,
  Calendar,
  Sun,
  CalendarDays,
  CalendarRange,
  Layers,
  Banknote,
  ShoppingBag,
  TrendingUp,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

export const OrdersHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = (searchParams.get('filter') as 'all' | 'today' | 'week' | 'month') || 'all';

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders(search);
      setOrders(data);
    } catch (err: any) {
      addToast('error', 'Gagal memuat riwayat transaksi', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [search]);

  const handleFilterChange = (filter: 'all' | 'today' | 'week' | 'month') => {
    if (filter === 'all') {
      searchParams.delete('filter');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ filter });
    }
  };

  // Filter orders by date range
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();

    if (filterParam === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return orderDate >= startOfDay;
    }

    if (filterParam === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      return orderDate >= sevenDaysAgo;
    }

    if (filterParam === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return orderDate >= startOfMonth;
    }

    return true; // 'all'
  });

  // Calculate Metrics for Current Filter
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCount = filteredOrders.length;
  const avgOrderValue = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filterTabs = [
    { key: 'all', label: 'Semua Transaksi', icon: Layers },
    { key: 'today', label: 'Harian (Hari Ini)', icon: Sun },
    { key: 'week', label: 'Mingguan (7 Hari)', icon: CalendarDays },
    { key: 'month', label: 'Bulanan (Bulan Ini)', icon: CalendarRange },
  ];

  const getFilterLabel = () => {
    switch (filterParam) {
      case 'today':
        return 'Laporan Transaksi Harian (Hari Ini)';
      case 'week':
        return 'Laporan Transaksi Mingguan (7 Hari Terakhir)';
      case 'month':
        return 'Laporan Transaksi Bulanan (Bulan Ini)';
      default:
        return 'Laporan Keseluruhan Transaksi';
    }
  };

  // Export to Excel (.csv format with UTF-8 BOM for Excel compatibility)
  const handleExportExcel = () => {
    if (filteredOrders.length === 0) {
      addToast('info', 'Tidak Ada Data', 'Tidak ada data transaksi untuk diexport pada filter ini.');
      return;
    }

    const filterName =
      filterParam === 'today'
        ? 'Harian'
        : filterParam === 'week'
        ? 'Mingguan'
        : filterParam === 'month'
        ? 'Bulanan'
        : 'Semua';

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // UTF-8 BOM byte order mark to ensure Excel handles characters & numbers correctly
    let csvContent = '\uFEFF';

    // Header Metadata
    csvContent += `LAPORAN TRANSAKSI PENJUALAN - POS ZALDE STORE\n`;
    csvContent += `Periode Filter,${getFilterLabel()}\n`;
    csvContent += `Tanggal Export,${now.toLocaleString('id-ID')}\n\n`;

    // Summary Revenue Section
    csvContent += `=== RINGKASAN PEMASUKAN ===\n`;
    csvContent += `TOTAL PEMASUKAN / OMSET,${totalRevenue}\n`;
    csvContent += `TOTAL TRANSAKSI,${totalCount}\n`;
    csvContent += `RATA-RATA HARGA PER ORDER,${avgOrderValue}\n\n`;

    // Transactions Table Header
    csvContent += `=== DAFTAR TRANSAKSI ===\n`;
    csvContent += `No,No. Order,Waktu Transaksi,Metode Pembayaran,Jumlah Item,Total Transaksi (Rp)\n`;

    // Table Data Rows
    filteredOrders.forEach((ord, idx) => {
      const itemCount = ord.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
      const formattedDate = new Date(ord.createdAt).toLocaleString('id-ID').replace(/,/g, '');
      csvContent += `${idx + 1},"${ord.orderNumber}","${formattedDate}","${ord.paymentMethod}",${itemCount},${ord.totalAmount}\n`;
    });

    // Total Summary Row at the bottom
    const totalItems = filteredOrders.reduce(
      (sum, ord) => sum + (ord.items?.reduce((s, i) => s + i.quantity, 0) || 0),
      0
    );
    csvContent += `\nTOTAL REKAPITULASI,,,${filteredOrders.length} Transaksi,${totalItems} Item,${totalRevenue}\n`;

    // Create & Trigger Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Penjualan_${filterName}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(
      'success',
      'Export Excel Berhasil!',
      `Laporan ${filterName} (${totalCount} transaksi - Total Omset: ${formatCurrency(totalRevenue)}) telah diunduh.`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Metrics Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Omset ({filterParam === 'all' ? 'Semua' : filterParam === 'today' ? 'Hari Ini' : filterParam === 'week' ? 'Mingguan' : 'Bulan Ini'})
            </span>
            <h3 className="text-lg font-extrabold text-white mt-0.5">{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Jumlah Transaksi
            </span>
            <h3 className="text-lg font-extrabold text-white mt-0.5">{totalCount} Transaksi</h3>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Rata-rata Order
            </span>
            <h3 className="text-lg font-extrabold text-white mt-0.5">{formatCurrency(avgOrderValue)}</h3>
          </div>
        </div>
      </div>

      {/* Header Actions & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800 overflow-x-auto w-full sm:w-auto">
          {filterTabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = filterParam === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleFilterChange(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Export Excel Button */}
        <button
          onClick={handleExportExcel}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0 w-full sm:w-auto justify-center"
          title="Export Laporan Penjualan ke Excel (.csv)"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export Excel
        </button>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-2xl overflow-hidden border-slate-800">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">No. Order</th>
                  <th className="p-4">Waktu Transaksi</th>
                  <th className="p-4">Metode Bayar</th>
                  <th className="p-4">Jumlah Item</th>
                  <th className="p-4">Total Transaksi</th>
                  <th className="p-4 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-emerald-400">{order.orderNumber}</td>
                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${
                          order.paymentMethod === 'QRIS'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {order.items?.reduce((sum, i) => sum + i.quantity, 0)} item
                    </td>
                    <td className="p-4 font-extrabold text-white">{formatCurrency(order.totalAmount)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailOpen(true);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg flex items-center gap-1.5 ml-auto text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Lihat Struk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <History className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-sm font-semibold">Tidak ada transaksi ditemukan</p>
            <p className="text-xs text-slate-500">Coba pilih rentang waktu filter lain atau ubah nomor order.</p>
          </div>
        )}
      </div>

      {/* ORDER DETAIL / RECEIPT MODAL */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Struk Transaksi"
        subtitle={`Order #${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs font-mono text-slate-300">
            <div className="text-center pb-3 border-b border-dashed border-slate-700">
              <h4 className="font-sans text-base font-bold text-white">POS ZALDE STORE</h4>
              <p className="text-[10px] text-slate-400">{formatDate(selectedOrder.createdAt)}</p>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-sans font-semibold text-slate-200">{item.product?.name || 'Produk'}</p>
                    <p className="text-[10px] text-slate-400">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-200">{formatCurrency(item.quantity * item.price)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-dashed border-slate-700 space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Bayar:</span>
                <span>{selectedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Jumlah Uang:</span>
                <span>{formatCurrency(selectedOrder.paymentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kembalian:</span>
                <span className="font-bold text-slate-100">{formatCurrency(selectedOrder.changeAmount)}</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Cetak Ulang Struk
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
