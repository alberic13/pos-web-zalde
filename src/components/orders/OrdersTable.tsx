import React from 'react';
import { Order } from '../../types';
import { TableSkeleton } from '../common/Skeleton';
import { Calendar, Eye, History } from 'lucide-react';

interface OrdersTableProps {
  loading: boolean;
  orders: Order[];
  formatCurrency: (val: number) => string;
  formatDate: (dateStr: string) => string;
  onViewDetail: (order: Order) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  loading,
  orders,
  formatCurrency,
  formatDate,
  onViewDetail,
}) => {
  return (
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
        ) : orders.length > 0 ? (
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
                {orders.map((order) => (
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
                        onClick={() => onViewDetail(order)}
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
            <p className="text-[11px] text-gray-700 font-semibold">
              Transaksi kasir hari ini akan muncul di sini secara otomatis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
