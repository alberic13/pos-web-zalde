import React from 'react';
import { ToastContainer } from '../components/common/Toast';
import { useOrdersHistory } from '../components/orders/useOrdersHistory';
import { OrderDailyKpiCards } from '../components/orders/OrderDailyKpiCards';
import { OrdersTable } from '../components/orders/OrdersTable';
import { OrderDetailReceiptModal } from '../components/orders/OrderDetailReceiptModal';
import { Sun, FileSpreadsheet } from 'lucide-react';

export const OrdersHistoryPage: React.FC = () => {
  const {
    orders,
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
  } = useOrdersHistory();

  return (
    <div className="space-y-5 animate-fade-in font-sans text-black">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <OrderDailyKpiCards
        totalRevenue={totalRevenue}
        totalCount={totalCount}
        avgOrderValue={avgOrderValue}
        formatCurrency={formatCurrency}
      />

      <div className="mac-window p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black text-black uppercase">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>
            Transaksi Harian (Hari Ini - {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})
          </span>
        </div>

        <button
          onClick={handleExportExcel}
          className="mac-btn px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-center"
          title="Export Laporan Penjualan Harian ke Excel (.csv)"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export Excel Harian
        </button>
      </div>

      <OrdersTable
        loading={loading}
        orders={orders}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        onViewDetail={(ord) => {
          setSelectedOrder(ord);
          setIsDetailOpen(true);
        }}
      />

      <OrderDetailReceiptModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        order={selectedOrder}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </div>
  );
};
