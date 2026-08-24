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

    let lastDateStr = new Date().toDateString();

    const checkAndSync = () => {
      const currentDateStr = new Date().toDateString();
      if (currentDateStr !== lastDateStr) {
        lastDateStr = currentDateStr;
        loadOrders();
      }
    };

    // Auto-check midnight date change & sync every 10 seconds
    const interval = setInterval(checkAndSync, 10000);
    return () => clearInterval(interval);
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
    <div className="space-y-5 animate-fade-in font-sans text-black">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Metrics Summary Header (Daily) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="mac-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
              Total Omset Hari Ini
            </span>
            <h3 className="text-lg font-black text-black mt-0.5">{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>

        <div className="mac-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
              Jumlah Transaksi Hari Ini
            </span>
            <h3 className="text-lg font-black text-black mt-0.5">{totalCount} Transaksi</h3>
          </div>
        </div>

        <div className="mac-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
              Rata-rata Order Hari Ini
            </span>
            <h3 className="text-lg font-black text-black mt-0.5">{formatCurrency(avgOrderValue)}</h3>
          </div>
        </div>
      </div>

      {/* Header Actions: Harian Title & Export Excel Button Mac OS Window */}
      <div className="mac-window p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Harian Title Badge */}
        <div className="flex items-center gap-2 text-xs font-black text-black uppercase">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>
            Transaksi Harian (Hari Ini - {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})
          </span>
        </div>

        {/* Export Excel Button */}
        <button
          onClick={handleExportExcel}
          className="mac-btn px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-center"
          title="Export Laporan Penjualan Harian ke Excel (.csv)"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export Excel Harian
        </button>
      </div>

      {/* Orders Table Mac OS Window */}
      <div className="mac-window p-0 overflow-hidden">
        <div className="mac-window-header">
          <h3 className="text-xs font-black uppercase text-black">
            Riwayat Transaksi Penjualan Kasir (Hari Ini)
          </h3>
        </div>

        <div className="p-3 bg-white">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={6} />
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="mac-table">
                <thead>
                  <tr>
                    <th className="mac-th">No. Order</th>
                    <th className="mac-th">Waktu Transaksi</th>
                    <th className="mac-th">Metode Bayar</th>
                    <th className="mac-th">Jumlah Item</th>
                    <th className="mac-th">Total Transaksi</th>
                    <th className="mac-th text-right">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="mac-tr">
                      <td className="mac-td font-mono font-black text-black">{order.orderNumber}</td>
                      <td className="mac-td text-gray-800 font-semibold">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-700" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </td>
                      <td className="mac-td">
                        <span
                          className={`mac-badge ${
                            order.paymentMethod === 'QRIS' ? 'mac-badge-indigo' : 'mac-badge-emerald'
                          }`}
                        >
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="mac-td font-bold text-gray-800">
                        {order.items?.reduce((sum, i) => sum + i.quantity, 0)} item
                      </td>
                      <td className="mac-td font-black text-black">{formatCurrency(order.totalAmount)}</td>
                      <td className="mac-td text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailOpen(true);
                          }}
                          className="mac-btn px-2.5 py-1 text-xs font-black uppercase flex items-center gap-1 ml-auto"
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
            <div className="text-center py-16 text-black space-y-2">
              <History className="w-10 h-10 mx-auto text-gray-600" />
              <p className="text-xs font-black uppercase">Belum ada transaksi hari ini</p>
              <p className="text-[11px] text-gray-700 font-semibold">Transaksi kasir hari ini akan muncul di sini secara otomatis.</p>
            </div>
          )}
        </div>
      </div>

      {/* ORDER DETAIL / RECEIPT MODAL */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Struk Transaksi"
        subtitle={`Order #${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <div className="space-y-3.5 text-xs font-mono text-black">
            <div className="text-center pb-2 border-b-2 border-dashed border-black">
              <h4 className="font-sans text-sm font-black text-black uppercase">POS ZALDE STORE</h4>
              <p className="text-[10px] text-gray-700 font-bold">{formatDate(selectedOrder.createdAt)}</p>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-sans font-extrabold text-black">{item.product?.name || 'Produk'}</p>
                    <p className="text-[10px] text-gray-700 font-bold">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-black text-black">{formatCurrency(item.quantity * item.price)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t-2 border-dashed border-black space-y-1 text-black font-bold">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-black text-black">{formatCurrency(selectedOrder.totalAmount)}</span>
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
                <span className="font-black text-black">{formatCurrency(selectedOrder.changeAmount)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => window.print()}
                className="mac-btn w-full py-2 text-xs font-black uppercase flex items-center justify-center gap-1.5"
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
