import React from 'react';
import { DashboardStats } from '../../types';
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react';

interface DashboardKpiCardsProps {
  stats: DashboardStats | null;
  formatCurrency: (val: number) => string;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({ stats, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="mac-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Pendapatan Hari Ini</span>
          <div className="w-8 h-8 rounded-full bg-white border border-black flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4 text-black" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-black mt-3">{formatCurrency(stats?.todayRevenue || 0)}</p>
        <div className="flex items-center gap-1.5 text-xs text-black font-extrabold mt-2">
          <span className="mac-badge mac-badge-emerald">
            <TrendingUp className="w-3 h-3" />
            <span>{stats?.todayOrdersCount || 0} Transaksi</span>
          </span>
        </div>
      </div>

      <div className="mac-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Omset Bulan Ini</span>
          <div className="w-8 h-8 rounded-full bg-white border border-black flex items-center justify-center font-bold">
            <ShoppingBag className="w-4 h-4 text-black" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-black mt-3">{formatCurrency(stats?.monthRevenue || 0)}</p>
        <div className="flex items-center gap-1.5 text-xs text-black font-extrabold mt-2">
          <span className="mac-badge mac-badge-indigo">
            <ArrowUpRight className="w-3 h-3" />
            <span>{stats?.monthOrdersCount || 0} Transaksi</span>
          </span>
        </div>
      </div>

      <div className="mac-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Katalog Produk</span>
          <div className="w-8 h-8 rounded-full bg-white border border-black flex items-center justify-center font-bold">
            <Package className="w-4 h-4 text-black" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-black mt-3">
          {stats?.totalProductsCount || 0} <span className="text-xs font-bold text-gray-700">Item</span>
        </p>
        <p className="text-[11px] font-semibold text-gray-700 mt-2">Tersedia dalam katalog</p>
      </div>

      <div className="mac-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Peringatan Stok</span>
          <div className="w-8 h-8 rounded-full bg-white border border-black flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4 text-red-700" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-red-700 mt-3">
          {stats?.lowStockCount || 0} <span className="text-xs font-bold text-gray-700">Produk</span>
        </p>
        <span className="mac-badge mac-badge-rose mt-2">Stok ≤ 5 unit (perlu restock)</span>
      </div>
    </div>
  );
};
