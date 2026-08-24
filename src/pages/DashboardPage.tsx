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

  const loadDashboardData = async (isSilent = false) => {
    try {
      if (!isSilent && !stats) setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      if (!isSilent) setError(err.message || 'Gagal memuat statistik dashboard');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    let lastDateStr = new Date().toDateString();

    const checkMidnight = () => {
      const currentDateStr = new Date().toDateString();
      if (currentDateStr !== lastDateStr) {
        lastDateStr = currentDateStr;
        // Instant visual reset at 12:00 malam / 00:00 (pergantian hari)
        setStats((prev) =>
          prev
            ? {
                ...prev,
                todayRevenue: 0,
                todayOrdersCount: 0,
                recentOrders: [],
              }
            : null
        );
        loadDashboardData(true);
      }
    };

    // Check date change silently every 5 seconds (without screen flickering / skeleton refresh)
    const interval = setInterval(checkMidnight, 5000);
    return () => clearInterval(interval);
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
      {/* Welcome Banner Mac OS Window */}
      <div className="mac-window p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-black text-xs font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" /> Real-Time Store Analytics (System 7)
            </div>
            <h1 className="text-lg sm:text-xl font-black text-black uppercase">
              Ringkasan Performa Toko Hari Ini
            </h1>
            <p className="text-xs text-gray-800 font-semibold mt-1">
              Pantau arus penjualan, inventaris stok, dan statistik produk terlaris dalam satu tempat.
            </p>
          </div>
          <button
            onClick={() => loadDashboardData()}
            className="mac-btn px-4 py-2 text-xs font-black uppercase tracking-wider self-start sm:self-auto"
          >
            🔄 Refres Data
          </button>
        </div>
      </div>

      {/* KPI Cards (System 7 3D Bevel Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omset Hari Ini */}
        <div className="mac-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
              Pendapatan Hari Ini
            </span>
            <div className="w-8 h-8 rounded-full bg-white border border-black flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4 text-black" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-black mt-3">
            {formatCurrency(stats?.todayRevenue || 0)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-black font-extrabold mt-2">
            <span className="mac-badge mac-badge-emerald">
              <TrendingUp className="w-3 h-3" />
              <span>{stats?.todayOrdersCount || 0} Transaksi</span>
            </span>
          </div>
        </div>

        {/* Omset Bulan Ini */}
        <div className="mac-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
              Omset Bulan Ini
            </span>
            <div className="w-8 h-8 rounded-full bg-white border border-black flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4 text-black" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-black mt-3">
            {formatCurrency(stats?.monthRevenue || 0)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-black font-extrabold mt-2">
            <span className="mac-badge mac-badge-indigo">
              <ArrowUpRight className="w-3 h-3" />
              <span>{stats?.monthOrdersCount || 0} Transaksi</span>
            </span>
          </div>
        </div>

        {/* Total Produk */}
        <div className="mac-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
              Katalog Produk
            </span>
            <div className="w-8 h-8 rounded-full bg-white border border-black flex items-center justify-center font-bold">
              <Package className="w-4 h-4 text-black" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-black mt-3">
            {stats?.totalProductsCount || 0} <span className="text-xs font-bold text-gray-700">Item</span>
          </p>
          <p className="text-[11px] font-semibold text-gray-700 mt-2">Tersedia dalam katalog</p>
        </div>

        {/* Stok Menipis */}
        <div className="mac-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
              Peringatan Stok
            </span>
            <div className="w-8 h-8 rounded-full bg-white border border-black flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4 text-red-700" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-red-700 mt-3">
            {stats?.lowStockCount || 0} <span className="text-xs font-bold text-gray-700">Produk</span>
          </p>
          <span className="mac-badge mac-badge-rose mt-2">
            Stok ≤ 5 unit (perlu restock)
          </span>
        </div>
      </div>

      {/* Analytics Chart & Top Selling Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Chart (2 cols) */}
        <div className="lg:col-span-2 mac-window p-0 flex flex-col justify-between">
          <div className="mac-window-header">
            <h3 className="text-xs font-black uppercase text-black">
              Grafik Penjualan 7 Hari Terakhir
            </h3>
          </div>

          <div className="p-4 bg-white">
            <div className="h-72 w-full animate-chart-draw">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  key={stats?.salesChart ? stats.salesChart.length : 0}
                  data={stats?.salesChart || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cccccc" vertical={false} />
                  <XAxis dataKey="date" stroke="#000000" fontSize={10} tickLine={false} />
                  <YAxis stroke="#000000" fontSize={10} tickLine={false} tickFormatter={(v) => `Rp${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#e8e8e8',
                      borderColor: '#000000',
                      borderWidth: '2px',
                      color: '#000000',
                      fontWeight: 'bold',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Omset']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#000000"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    isAnimationActive={true}
                    animationBegin={200}
                    animationDuration={3800}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products (1 col) */}
        <div className="mac-window p-0 flex flex-col justify-between">
          <div className="mac-window-header">
            <h3 className="text-xs font-black uppercase text-black">
              5 Produk Terlaris
            </h3>
          </div>

          <div className="p-3 bg-white flex-1 space-y-3">
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.map((prod, idx) => (
                <div key={prod.id || idx} className="mac-card p-2 flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-gray-200 border border-black overflow-hidden shrink-0 flex items-center justify-center">
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
                      <span className="text-xs font-black text-black">#{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-black truncate">{prod.name}</p>
                    <p className="text-[10px] text-gray-700 font-medium">{prod.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="mac-badge mac-badge-emerald">
                      {prod.soldCount} terjual
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs font-bold text-gray-700 py-6 text-center uppercase">
                Belum ada data penjualan
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Warning Table */}
      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div className="mac-window p-0">
          <div className="mac-window-header flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-700" />
            <h3 className="text-xs font-black uppercase text-black">Peringatan: Stok Produk Menipis</h3>
          </div>
          <div className="p-3 bg-white overflow-x-auto">
            <table className="mac-table">
              <thead>
                <tr>
                  <th className="mac-th">SKU</th>
                  <th className="mac-th">Nama Produk</th>
                  <th className="mac-th">Kategori</th>
                  <th className="mac-th">Harga Jual</th>
                  <th className="mac-th">Sisa Stok</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.map((prod) => (
                  <tr key={prod.id} className="mac-tr">
                    <td className="mac-td font-mono font-bold">{prod.sku}</td>
                    <td className="mac-td font-extrabold">{prod.name}</td>
                    <td className="mac-td text-gray-700">{prod.category?.name}</td>
                    <td className="mac-td font-bold">{formatCurrency(prod.price)}</td>
                    <td className="mac-td">
                      <span className="mac-badge mac-badge-rose">
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
