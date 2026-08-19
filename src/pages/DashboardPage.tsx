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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/40 via-slate-900 to-slate-900 border border-emerald-500/20 p-6">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Real-time Store Analytics
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Ringkasan Performa Toko Hari Ini
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Pantau arus penjualan, inventaris stok, dan statistik produk terlaris dalam satu tempat.
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-xl transition-all self-start sm:self-auto"
          >
            Refres Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omset Hari Ini */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pendapatan Hari Ini
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-3">
            {formatCurrency(stats?.todayRevenue || 0)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats?.todayOrdersCount || 0} Transaksi Terproses</span>
          </div>
        </div>

        {/* Omset Bulan Ini */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Omset Bulan Ini
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-3">
            {formatCurrency(stats?.monthRevenue || 0)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{stats?.monthOrdersCount || 0} Transaksi Bulan Ini</span>
          </div>
        </div>

        {/* Total Produk */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Katalog Produk
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-3">
            {stats?.totalProductsCount || 0} <span className="text-sm font-normal text-slate-400">Item</span>
          </p>
          <p className="text-xs text-slate-400 mt-2">Tersedia dalam katalog</p>
        </div>

        {/* Stok Menipis */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Peringatan Stok
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-3">
            {stats?.lowStockCount || 0} <span className="text-sm font-normal text-slate-400">Produk</span>
          </p>
          <p className="text-xs text-amber-400/80 mt-2">Stok ≤ 5 unit (perlu restock)</p>
        </div>
      </div>

      {/* Analytics Chart & Top Selling Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-100">Grafik Penjualan 7 Hari Terakhir</h3>
              <p className="text-xs text-slate-400">Total omset penjualan per hari</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.salesChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `Rp${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Omset']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products (1 col) */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-1">5 Produk Terlaris</h3>
            <p className="text-xs text-slate-400 mb-4">Berdasarkan total unit terjual</p>

            <div className="space-y-3.5">
              {stats?.topProducts && stats.topProducts.length > 0 ? (
                stats.topProducts.map((prod, idx) => (
                  <div key={prod.id || idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
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
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                          #{idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{prod.name}</p>
                      <p className="text-[11px] text-slate-400">{prod.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {prod.soldCount} terjual
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">Belum ada data penjualan</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Table */}
      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div className="glass-card p-6 rounded-2xl border-amber-500/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-amber-300">Peringatan: Stok Produk Menipis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Nama Produk</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Harga Jual</th>
                  <th className="p-3">Sisa Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.lowStockProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-slate-400">{prod.sku}</td>
                    <td className="p-3 font-semibold text-slate-200">{prod.name}</td>
                    <td className="p-3 text-slate-400">{prod.category?.name}</td>
                    <td className="p-3 font-medium text-slate-200">{formatCurrency(prod.price)}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold">
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
