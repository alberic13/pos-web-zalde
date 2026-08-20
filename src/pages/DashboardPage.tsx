import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { DashboardStats } from '../types';
import { CardSkeleton } from '../components/common/Skeleton';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat statistik dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

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
      <div className="p-6 glass-card border-rose-500/30 text-center rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-rose-300">Gagal Memuat Dashboard</h3>
        <p className="text-sm text-slate-400 mt-1">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-xl text-slate-200 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7a35ff]/10 via-white to-white border border-[#7a35ff]/20 p-6 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#7a35ff] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Real-time Store Analytics
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Ringkasan Performa Toko Hari Ini
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Pantau arus penjualan, inventaris stok, dan statistik produk terlaris dalam satu tempat.
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 text-xs font-semibold bg-[#7a35ff] text-white hover:bg-[#6825e6] rounded-xl shadow-xs transition-all self-start sm:self-auto"
          >
            Refres Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omset Hari Ini */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-violet hover:border-[#7a35ff]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pendapatan Hari Ini
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#f3eeff] text-[#7a35ff] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">
            {formatCurrency(stats?.todayRevenue || 0)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#7a35ff] font-semibold mt-2">
            <span className="bg-[#f3eeff] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{stats?.todayOrdersCount || 0} Transaksi</span>
            </span>
          </div>
        </div>

        {/* Omset Bulan Ini */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-violet hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Omset Bulan Ini
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">
            {formatCurrency(stats?.monthRevenue || 0)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-cyan-700 font-semibold mt-2">
            <span className="bg-cyan-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>{stats?.monthOrdersCount || 0} Transaksi Bulan Ini</span>
            </span>
          </div>
        </div>

        {/* Total Produk */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-violet hover:border-[#7a35ff]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Katalog Produk
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#f3eeff] text-[#7a35ff] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">
            {stats?.totalProductsCount || 0} <span className="text-sm font-normal text-slate-500">Item</span>
          </p>
          <p className="text-xs text-slate-500 mt-2">Tersedia dalam katalog</p>
        </div>

        {/* Stok Menipis */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-violet hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Peringatan Stok
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-3">
            {stats?.lowStockCount || 0} <span className="text-sm font-normal text-slate-500">Produk</span>
          </p>
          <p className="text-xs text-amber-700/80 font-medium mt-2">Stok ≤ 5 unit (perlu restock)</p>
        </div>
      </div>

      {/* Analytics Chart & Top Selling Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Grafik Penjualan 7 Hari Terakhir</h3>
              <p className="text-xs text-slate-500">Total omset penjualan per hari</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.salesChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7a35ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7a35ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `Rp${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 12px rgba(122,53,255,0.12)',
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Omset']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7a35ff"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products (1 col) */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">5 Produk Terlaris</h3>
            <p className="text-xs text-slate-500 mb-4">Berdasarkan total unit terjual</p>

            <div className="space-y-3.5">
              {stats?.topProducts && stats.topProducts.length > 0 ? (
                stats.topProducts.map((prod, idx) => (
                  <div key={prod.id || idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                          #{idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{prod.name}</p>
                      <p className="text-[11px] text-slate-500">{prod.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-[#7a35ff] bg-[#f3eeff] px-2.5 py-0.5 rounded-full">
                        {prod.soldCount} terjual
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">Belum ada data penjualan</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Table */}
      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div className="bg-white border border-amber-200 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Peringatan: Stok Produk Menipis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Nama Produk</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Harga Jual</th>
                  <th className="p-3">Sisa Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.lowStockProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-3 font-mono text-slate-500">{prod.sku}</td>
                    <td className="p-3 font-semibold text-slate-800">{prod.name}</td>
                    <td className="p-3 text-slate-500">{prod.category?.name}</td>
                    <td className="p-3 font-medium text-slate-800">{formatCurrency(prod.price)}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-bold">
                        Sisa {prod.stock} unit
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
