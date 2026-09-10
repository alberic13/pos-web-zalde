import React from 'react';

interface TopSellingProductsProps {
  topProducts: Array<{
    id: string;
    name: string;
    category: string;
    imageUrl?: string | null;
    soldCount: number;
  }> | undefined;
}

export const TopSellingProducts: React.FC<TopSellingProductsProps> = ({ topProducts }) => {
  return (
    <div className="mac-window p-0 flex flex-col justify-between">
      <div className="mac-window-header">
        <h3 className="text-xs font-black uppercase text-black">5 Produk Terlaris</h3>
      </div>

      <div className="p-3 bg-white flex-1 space-y-3">
        {topProducts && topProducts.length > 0 ? (
          topProducts.map((prod, idx) => (
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
                <span className="mac-badge mac-badge-emerald">{prod.soldCount} terjual</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs font-bold text-gray-700 py-6 text-center uppercase">Belum ada data penjualan</p>
        )}
      </div>
    </div>
  );
};
