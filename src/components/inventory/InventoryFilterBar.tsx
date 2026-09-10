import React from 'react';
import { Search, Plus } from 'lucide-react';

interface InventoryFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'all' | 'low_display' | 'out_warehouse' | 'safe';
  onStatusFilterChange: (val: 'all' | 'low_display' | 'out_warehouse' | 'safe') => void;
  totalProducts: number;
  lowStockCount: number;
  onOpenCreateModal: () => void;
}

export const InventoryFilterBar: React.FC<InventoryFilterBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalProducts,
  lowStockCount,
  onOpenCreateModal,
}) => {
  return (
    <div className="mac-window p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:max-w-md">
        <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari produk gudang / SKU..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="mac-input w-full pl-9 pr-4 py-1.5 text-xs font-semibold placeholder-gray-600 shadow-inner"
        />
      </div>

      {/* Status Filter Badges & Create Button */}
      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`mac-btn px-3 py-1 text-xs whitespace-nowrap ${
              statusFilter === 'all' ? 'mac-btn-active' : ''
            }`}
          >
            Semua ({totalProducts})
          </button>
          <button
            onClick={() => onStatusFilterChange('low_display')}
            className={`mac-btn px-3 py-1 text-xs whitespace-nowrap ${
              statusFilter === 'low_display' ? 'mac-btn-active' : ''
            }`}
          >
            ⚠️ Perlu Restock ({lowStockCount})
          </button>
          <button
            onClick={() => onStatusFilterChange('out_warehouse')}
            className={`mac-btn px-3 py-1 text-xs whitespace-nowrap ${
              statusFilter === 'out_warehouse' ? 'mac-btn-active' : ''
            }`}
          >
            📦 Gudang Kosong
          </button>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="mac-btn px-3.5 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Tambah Produk Baru
        </button>
      </div>
    </div>
  );
};
