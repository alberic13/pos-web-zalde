import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Order } from '../../types';
import { ToastMessage } from '../common/Toast';
import { formatCurrency, formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/error';

export function useOrdersHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToasts((prev) => [...prev, { id: Date.now().toString(), type, title, message }]);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const loadOrders = async (isSilent = false) => {
    try {
      if (!isSilent && orders.length === 0) setLoading(true);
      const data = await api.getOrders();
      setOrders(data);
    } catch (err: unknown) {
      if (!isSilent) addToast('error', 'Gagal memuat riwayat transaksi', getErrorMessage(err));
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    let lastDateStr = new Date().toDateString();

    const checkMidnight = () => {
      const currentDateStr = new Date().toDateString();
      if (currentDateStr !== lastDateStr) {
        lastDateStr = currentDateStr;
        loadOrders(true);
      }
    };

    const interval = setInterval(checkMidnight, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return orderDate >= startOfDay;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCount = filteredOrders.length;
  const avgOrderValue = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

  const handleExportExcel = () => {
    if (filteredOrders.length === 0) {
      return addToast('info', 'Tidak Ada Data', 'Belum ada data transaksi harian untuk diexport.');
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let csv = '\uFEFF';
    csv += `LAPORAN TRANSAKSI PENJUALAN HARIAN - POS ZALDE STORE\nPeriode,Laporan Harian (${now.toLocaleDateString('id-ID')})\n\n`;
    csv += `TOTAL PEMASUKAN,${totalRevenue}\nTOTAL TRANSAKSI,${totalCount}\nRATA-RATA,${avgOrderValue}\n\n`;
    csv += `No,No. Order,Waktu Transaksi,Metode Pembayaran,Jumlah Item,Total Transaksi (Rp)\n`;

    filteredOrders.forEach((ord, idx) => {
      const itemCount = ord.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
      const fDate = formatDate(ord.createdAt);
      csv += `${idx + 1},"${ord.orderNumber}","${fDate}","${ord.paymentMethod}",${itemCount},${ord.totalAmount}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Transaksi_Harian_${dateStr}.csv`;
    link.click();
    addToast('success', 'Export Excel Berhasil!', `Laporan (${totalCount} transaksi) telah diunduh.`);
  };

  return {
    orders: filteredOrders,
    loading,
    selectedOrder,
    setSelectedOrder,
    isDetailOpen,
    setIsDetailOpen,
    toasts,
    removeToast,
    totalRevenue,
    totalCount,
    avgOrderValue,
    formatCurrency,
    formatDate,
    handleExportExcel,
  };
}
