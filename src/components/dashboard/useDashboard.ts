import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { DashboardStats } from '../../types';

export function useDashboard() {
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

    const interval = setInterval(checkMidnight, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return {
    stats,
    loading,
    error,
    loadDashboardData,
    formatCurrency,
  };
}
