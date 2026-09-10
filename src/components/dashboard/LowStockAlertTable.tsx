import React from 'react';
import { Product } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface LowStockAlertTableProps {
  products: Product[] | undefined;
  formatCurrency: (val: number) => string;
}

export const LowStockAlertTable: React.FC<LowStockAlertTableProps> = ({ products, formatCurrency }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="mac-window p-0">
      <div className="mac-window-header flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-700" />
        <h3 className="text-xs font-black uppercase text-black">Peringatan: Stok Produk Menipis</h3>
      </div>
      <div className="p-3 bg-white overflow-x-auto">
        <table className="mac-table">
          <thead>
            <tr>
              <th className="mac-th">SKU</th>
              <th className="mac-th">Nama Produk</th>
              <th className="mac-th">Kategori</th>
              <th className="mac-th">Harga Jual</th>
              <th className="mac-th">Sisa Stok</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id} className="mac-tr">
                <td className="mac-td font-mono font-bold">{prod.sku}</td>
                <td className="mac-td font-extrabold">{prod.name}</td>
                <td className="mac-td text-gray-700">{prod.category?.name}</td>
                <td className="mac-td font-bold">{formatCurrency(prod.price)}</td>
                <td className="mac-td">
                  <span className="mac-badge mac-badge-rose">Sisa {prod.stock} unit</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
