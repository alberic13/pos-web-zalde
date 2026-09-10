import React from 'react';
import { Building2, Boxes, AlertTriangle, Banknote } from 'lucide-react';

interface SupplierOrderKpisProps {
  supplierCount: number;
  totalWarehouseStock: number;
  lowWarehouseCount: number;
  totalOrderValue: number;
}

export const SupplierOrderKpis: React.FC<SupplierOrderKpisProps> = ({
  supplierCount,
  totalWarehouseStock,
  lowWarehouseCount,
  totalOrderValue,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="mac-card p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">Supplier Terdaftar</span>
          <h3 className="text-xl font-black text-black mt-0.5">{supplierCount} <span className="text-xs font-bold text-gray-700">Distributor</span></h3>
        </div>
      </div>

      <div className="mac-card p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">Stok Cadangan Gudang</span>
          <h3 className="text-xl font-black text-black mt-0.5">{totalWarehouseStock} <span className="text-xs font-bold text-gray-700">Unit</span></h3>
        </div>
      </div>

      <div className="mac-card p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-red-700 font-bold shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">Gudang Menipis (≤ 5 Unit)</span>
          <h3 className="text-xl font-black text-red-700 mt-0.5">{lowWarehouseCount} <span className="text-xs font-bold text-gray-700">Produk</span></h3>
        </div>
      </div>

      <div className="mac-card p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
          <Banknote className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">Estimasi Rencana Restock</span>
          <h3 className="text-base font-black text-black mt-0.5">{formatCurrency(totalOrderValue)}</h3>
        </div>
      </div>
    </div>
  );
};
