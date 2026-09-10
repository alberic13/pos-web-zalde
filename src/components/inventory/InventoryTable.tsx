import React from 'react';
import { Product } from '../../types';
import { TableSkeleton } from '../common/Skeleton';
import { InventoryTableRow } from './InventoryTableRow';
import { Warehouse } from 'lucide-react';

interface InventoryTableProps {
  loading: boolean;
  products: Product[];
  onTransfer: (prod: Product) => void;
  onRestock: (prod: Product) => void;
  onView: (prod: Product) => void;
  onEdit: (prod: Product) => void;
  onDelete: (prod: Product) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  loading,
  products,
  onTransfer,
  onRestock,
  onView,
  onEdit,
  onDelete,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="mac-window p-0 overflow-hidden">
      <div className="mac-window-header">
        <h3 className="text-xs font-black uppercase text-black">
          Manajemen Inventaris Stok Etalase Kasir & Gudang
        </h3>
      </div>

      <div className="p-3 bg-white">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="mac-table">
              <thead>
                <tr>
                  <th className="mac-th">Foto & Nama Produk</th>
                  <th className="mac-th">SKU</th>
                  <th className="mac-th">Stok Etalase</th>
                  <th className="mac-th">Stok Gudang</th>
                  <th className="mac-th">Harga Jual</th>
                  <th className="mac-th text-right">Aksi Management</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <InventoryTableRow
                    key={prod.id}
                    product={prod}
                    formatCurrency={formatCurrency}
                    onTransfer={onTransfer}
                    onRestock={onRestock}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-black space-y-2">
            <Warehouse className="w-10 h-10 mx-auto text-gray-600" />
            <p className="text-xs font-black uppercase">Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
};
