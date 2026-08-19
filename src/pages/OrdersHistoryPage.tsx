import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Order } from '../types';
import { TableSkeleton } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import {
  Eye,
  History,
  Printer,
  Calendar,
  Sun,
  Banknote,
  ShoppingBag,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

export const OrdersHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      const data = await api.getOrders();
      setOrders(data);
    } catch (err: any) {
      addToast('error', 'Gagal memuat riwayat transaksi', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders for Today (Harian) only
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return orderDate >= startOfDay;
  });

  // Calculate Daily Metrics
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

  // Export Today's Transactions to Excel (.csv)
  const handleExportExcel = () => {
    if (filteredOrders.length === 0) {
      addToast('info', 'Tidak Ada Data', 'Belum ada data transaksi harian (hari ini) untuk diexport.');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // UTF-8 BOM byte order mark to ensure Excel handles characters & numbers correctly
    let csvContent = '\uFEFF';

    // Header Metadata
    csvContent += `LAPORAN TRANSAKSI PENJUALAN HARIAN - POS ZALDE STORE\n`;
    csvContent += `Periode,Laporan Harian (Hari Ini - ${now.toLocaleDateString('id-ID')})\n`;
    csvContent += `Tanggal Export,${now.toLocaleString('id-ID')}\n\n`;

    // Summary Revenue Section
    csvContent += `=== RINGKASAN PEMASUKAN HARIAN ===\n`;
    csvContent += `TOTAL PEMASUKAN / OMSET HARI INI,${totalRevenue}\n`;
    csvContent += `TOTAL TRANSAKSI HARI INI,${totalCount}\n`;
    csvContent += `RATA-RATA HARGA PER ORDER,${avgOrderValue}\n\n`;

    // Transactions Table Header
    csvContent += `=== DAFTAR TRANSAKSI HARIAN ===\n`;
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
    csvContent += `\nTOTAL REKAPITULASI HARIAN,,,${filteredOrders.length} Transaksi,${totalItems} Item,${totalRevenue}\n`;

    // Create & Trigger Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Transaksi_Harian_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(
      'success',
      'Export Excel Berhasil!',
      `Laporan Harian (${totalCount} transaksi - Total Omset: ${formatCurrency(totalRevenue)}) telah diunduh.`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Metrics Summary Header (Daily) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Omset Hari Ini
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
              Jumlah Transaksi Hari Ini
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
              Rata-rata Order Hari Ini
            </span>
            <h3 className="text-lg font-extrabold text-white mt-0.5">{formatCurrency(avgOrderValue)}</h3>
          </div>
        </div>
      </div>

      {/* Header Actions: Harian Title & Export Excel Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Harian Title Badge */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800">
          <Sun className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-100">
            Transaksi Harian (Hari Ini - {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})
          </span>
        </div>

        {/* Export Excel Button */}
        <button
          onClick={handleExportExcel}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0 w-full sm:w-auto justify-center"
          title="Export Laporan Penjualan Harian ke Excel (.csv)"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export Excel Harian
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
            <p className="text-sm font-semibold">Belum ada transaksi hari ini</p>
            <p className="text-xs text-slate-500">Transaksi kasir hari ini akan muncul di sini secara otomatis.</p>
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
