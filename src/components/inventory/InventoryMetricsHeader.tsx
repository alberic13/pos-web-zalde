import React from 'react';
import { Store, Boxes, AlertTriangle, Banknote } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface InventoryMetricsHeaderProps {
  totalDisplayStock: number;
  totalWarehouseStock: number;
  lowStockCount: number;
  totalAssetValue: number;
}

export const InventoryMetricsHeader: React.FC<InventoryMetricsHeaderProps> = ({
  totalDisplayStock,
  totalWarehouseStock,
  lowStockCount,
  totalAssetValue,
}) => {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Stok Etalase */}
      <div className="mac-card p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
            Stok Etalase Kasir
          </span>
          <h3 className="text-xl font-black text-black mt-0.5">
            {totalDisplayStock}{' '}
            <span className="text-xs font-bold text-gray-700">Unit</span>
          </h3>
        </div>
      </div>

      {/* Stok Gudang */}
      <div className="mac-card p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
            Stok Cadangan Gudang
          </span>
          <h3 className="text-xl font-black text-black mt-0.5">
            {totalWarehouseStock}{' '}
            <span className="text-xs font-bold text-gray-700">Unit</span>
          </h3>
        </div>
      </div>

      {/* Etalase Menipis Warning */}
      <div className="mac-card p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-red-700 font-bold shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
            Etalase Menipis (≤ 5 Unit)
          </span>
          <h3 className="text-xl font-black text-red-700 mt-0.5">
            {lowStockCount}{' '}
            <span className="text-xs font-bold text-gray-700">Produk</span>
          </h3>
        </div>
      </div>

      {/* Total Asset Value */}
      <div className="mac-card p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
          <Banknote className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
            Total Aset (Toko + Gudang)
          </span>
          <h3 className="text-base font-black text-black mt-0.5">
            {formatCurrency(totalAssetValue)}
          </h3>
        </div>
      </div>
    </div>
  );
};
