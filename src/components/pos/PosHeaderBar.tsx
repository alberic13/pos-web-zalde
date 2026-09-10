import React from 'react';
import { Search, ShoppingCart } from 'lucide-react';

interface PosHeaderBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  onSearchSubmit: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export const PosHeaderBar: React.FC<PosHeaderBarProps> = ({
  search,
  onSearchChange,
  onClearSearch,
  onSearchSubmit,
  searchInputRef,
}) => {
  return (
    <div className="mac-window mb-4 p-2 sm:p-3 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Brand Logo Vintage Rainbow Apple */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full rainbow-arrow-badge flex items-center justify-center border border-black shadow-xs">
          <ShoppingCart className="w-4 h-4 text-white drop-shadow-md" />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight text-black flex items-center gap-1.5">
            Vintage Classic POS Kasir
          </h1>
          <span className="text-[10px] font-bold text-gray-700 block -mt-0.5">
            System
          </span>
        </div>
      </div>

      {/* Search Bar & Go Button */}
      <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-lg mx-auto">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari Produk... (F2 / Esc)"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mac-input w-full pl-9 pr-8 py-1.5 text-xs font-semibold placeholder-gray-500 shadow-inner"
          />
          {search && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black font-bold text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onSearchSubmit}
          className="mac-btn px-4 py-1.5 text-xs uppercase tracking-wider font-extrabold"
        >
          Go
        </button>
      </div>

      {/* User Profile Avatar */}
      <div className="hidden md:flex items-center gap-2 border-l border-gray-400 pl-4">
        <div className="w-7 h-7 rounded-full bg-gray-300 border border-black overflow-hidden flex items-center justify-center text-xs font-bold shadow-2xs">
          👤
        </div>
        <span className="text-xs font-bold text-black">Kasir Toko</span>
      </div>
    </div>
  );
};
