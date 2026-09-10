import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Category } from '../../types';

interface SupplierFilterHeaderProps {
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  categories: Category[];
  onOpenCreate: () => void;
}

export const SupplierFilterHeader: React.FC<SupplierFilterHeaderProps> = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  categories,
  onOpenCreate,
}) => {
  return (
    <div className="mac-window p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama supplier / contact person..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mac-input w-full pl-9 pr-4 py-1.5 text-xs font-semibold placeholder-gray-600 shadow-inner"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mac-select w-full sm:w-auto text-xs cursor-pointer font-bold"
        >
          <option value="all">Semua Kategori Pasokan</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onOpenCreate}
        className="mac-btn px-3.5 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-center"
      >
        <Plus className="w-4 h-4" /> Tambah Supplier Baru
      </button>
    </div>
  );
};
