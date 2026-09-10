import React from 'react';
import { CardSkeleton } from '../components/common/Skeleton';
import { AlertTriangle } from 'lucide-react';
import { useDashboard } from '../components/dashboard/useDashboard';
import { DashboardWelcomeBanner } from '../components/dashboard/DashboardWelcomeBanner';
import { DashboardKpiCards } from '../components/dashboard/DashboardKpiCards';
import { SalesAreaChart } from '../components/dashboard/SalesAreaChart';
import { TopSellingProducts } from '../components/dashboard/TopSellingProducts';
import { LowStockAlertTable } from '../components/dashboard/LowStockAlertTable';

export const DashboardPage: React.FC = () => {
  const { stats, loading, error, loadDashboardData, formatCurrency } = useDashboard();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 text-center rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-rose-900">Gagal Memuat Dashboard</h3>
        <p className="text-sm text-slate-600 mt-1">{error}</p>
        <button
          onClick={() => loadDashboardData()}
          className="mt-4 px-4 py-2 bg-[#7a35ff] hover:bg-[#6825e6] text-sm font-bold rounded-xl text-white transition-all shadow-md shadow-[#7a35ff]/25"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in font-sans text-black">
      <DashboardWelcomeBanner onRefresh={() => loadDashboardData()} />

      <DashboardKpiCards stats={stats} formatCurrency={formatCurrency} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SalesAreaChart salesChart={stats?.salesChart} formatCurrency={formatCurrency} />
        <TopSellingProducts topProducts={stats?.topProducts} />
      </div>

      <LowStockAlertTable products={stats?.lowStockProducts} formatCurrency={formatCurrency} />
    </div>
  );
};
