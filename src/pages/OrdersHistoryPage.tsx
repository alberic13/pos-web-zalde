import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Order } from '../types';
import { TableSkeleton } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Search, Eye, History, Printer, Calendar } from 'lucide-react';

export const OrdersHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  return (
    <div className="space-y-6 animate-fade-in">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor order transaksi (ORD-...)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-2xl overflow-hidden border-slate-800">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : orders.length > 0 ? (
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
                {orders.map((order) => (
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
            <p className="text-sm font-semibold">Belum ada riwayat transaksi</p>
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
