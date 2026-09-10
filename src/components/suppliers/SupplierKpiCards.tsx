import React from 'react';
import { Building2, Package } from 'lucide-react';

interface SupplierKpiCardsProps {
  supplierCount: number;
  categoryCount: number;
}

export const SupplierKpiCards: React.FC<SupplierKpiCardsProps> = ({ supplierCount, categoryCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="mac-card p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">Total Supplier Terdaftar</span>
          <h3 className="text-xl font-black text-black mt-0.5">{supplierCount} <span className="text-xs font-bold text-gray-700">Distributor</span></h3>
        </div>
      </div>

      <div className="mac-card p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">Kategori Produk (Database)</span>
          <h3 className="text-xl font-black text-black mt-0.5">{categoryCount} <span className="text-xs font-bold text-gray-700">Kategori</span></h3>
        </div>
      </div>
    </div>
  );
};
