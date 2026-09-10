import React from 'react';

interface DashboardWelcomeBannerProps {
  onRefresh: () => void;
}

export const DashboardWelcomeBanner: React.FC<DashboardWelcomeBannerProps> = ({ onRefresh }) => {
  return (
    <div className="mac-window p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-black text-xs font-black uppercase tracking-wider mb-1">
            Real-Time Store Analytics (System 7)
          </div>
          <h1 className="text-lg sm:text-xl font-black text-black uppercase">
            Ringkasan Performa Toko Hari Ini
          </h1>
          <p className="text-xs text-gray-800 font-semibold mt-1">
            Pantau arus penjualan, inventaris stok, dan statistik produk terlaris dalam satu tempat.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="mac-btn px-4 py-2 text-xs font-black uppercase tracking-wider self-start sm:self-auto"
        >
          🔄 Refres Data
        </button>
      </div>
    </div>
  );
};
