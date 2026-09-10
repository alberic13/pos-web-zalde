import React from 'react';
import { Search } from 'lucide-react';

interface SupplierOrderFilterBarProps {
  filterMode: 'all' | 'low' | 'empty';
  setFilterMode: (mode: 'all' | 'low' | 'empty') => void;
  productCount: number;
  lowWarehouseCount: number;
  search: string;
  setSearch: (val: string) => void;
}

export const SupplierOrderFilterBar: React.FC<SupplierOrderFilterBarProps> = ({
  filterMode,
  setFilterMode,
  productCount,
  lowWarehouseCount,
  search,
  setSearch,
}) => {
  return (
    <div className="mac-window p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
        <button
          onClick={() => setFilterMode('all')}
          className={`mac-btn px-3 py-1 text-xs font-bold whitespace-nowrap ${
            filterMode === 'all' ? 'mac-btn-active' : ''
          }`}
        >
          Semua Produk ({productCount})
        </button>
        <button
          onClick={() => setFilterMode('low')}
          className={`mac-btn px-3 py-1 text-xs font-bold whitespace-nowrap ${
            filterMode === 'low' ? 'mac-btn-active' : ''
          }`}
        >
          ⚠️ Gudang Menipis ({lowWarehouseCount})
        </button>
        <button
          onClick={() => setFilterMode('empty')}
          className={`mac-btn px-3 py-1 text-xs font-bold whitespace-nowrap ${
            filterMode === 'empty' ? 'mac-btn-active' : ''
          }`}
        >
          🚫 Gudang Kosong
        </button>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari barang / SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mac-input w-full pl-9 pr-4 py-1.5 text-xs font-semibold placeholder-gray-600 shadow-inner"
        />
      </div>
    </div>
  );
};
