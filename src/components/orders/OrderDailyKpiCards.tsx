import React from 'react';
import { Banknote, ShoppingBag, TrendingUp } from 'lucide-react';

interface OrderDailyKpiCardsProps {
  totalRevenue: number;
  totalCount: number;
  avgOrderValue: number;
  formatCurrency: (val: number) => string;
}

export const OrderDailyKpiCards: React.FC<OrderDailyKpiCardsProps> = ({
  totalRevenue,
  totalCount,
  avgOrderValue,
  formatCurrency,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="mac-card p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
          <Banknote className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">Total Omset Hari Ini</span>
          <h3 className="text-lg font-black text-black mt-0.5">{formatCurrency(totalRevenue)}</h3>
        </div>
      </div>

      <div className="mac-card p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">Jumlah Transaksi Hari Ini</span>
          <h3 className="text-lg font-black text-black mt-0.5">{totalCount} Transaksi</h3>
        </div>
      </div>

      <div className="mac-card p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">Rata-rata Order Hari Ini</span>
          <h3 className="text-lg font-black text-black mt-0.5">{formatCurrency(avgOrderValue)}</h3>
        </div>
      </div>
    </div>
  );
};
