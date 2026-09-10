import React from 'react';
import { Product } from '../../types';
import { TableSkeleton } from '../common/Skeleton';
import { ProductImage } from './ProductImage';
import {
  Warehouse,
  Plus,
  Edit3,
  Trash2,
  Eye,
  ArrowRightLeft,
} from 'lucide-react';

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
                {products.map((prod) => {
                  const isDisplayLow = prod.stock <= 5;
                  const isWarehouseOut = prod.warehouseStock <= 0;
                  const isWarehouseLow = prod.warehouseStock <= 5;

                  return (
                    <tr key={prod.id} className="mac-tr">
                      {/* PRODUCT & CATEGORY */}
                      <td className="mac-td">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 border border-black overflow-hidden shrink-0 flex items-center justify-center">
                            <ProductImage src={prod.imageUrl} alt={prod.name} />
                          </div>
                          <div>
                            <span className="font-extrabold text-black block text-xs">
                              {prod.name}
                            </span>
                            <span className="text-[10px] text-gray-700 font-semibold">
                              {prod.category?.name || 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="mac-td font-mono font-bold text-xs">
                        {prod.sku}
                      </td>

                      {/* STOK ETALASE KASIR */}
                      <td className="mac-td whitespace-nowrap">
                        <span
                          className={`mac-badge ${
                            prod.stock <= 0
                              ? 'mac-badge-rose'
                              : isDisplayLow
                              ? 'mac-badge-amber'
                              : 'mac-badge-emerald'
                          }`}
                        >
                          <span>{prod.stock} Unit</span>
                          {isDisplayLow && <span className="ml-1">(Refill)</span>}
                        </span>
                      </td>

                      {/* STOK CADANGAN GUDANG */}
                      <td className="mac-td whitespace-nowrap">
                        <span
                          className={`mac-badge ${
                            isWarehouseOut
                              ? 'mac-badge-rose'
                              : isWarehouseLow
                              ? 'mac-badge-amber'
                              : 'mac-badge-indigo'
                          }`}
                        >
                          <span>{prod.warehouseStock} Unit</span>
                          {isWarehouseOut ? (
                            <span className="ml-1">(Kosong)</span>
                          ) : isWarehouseLow ? (
                            <span className="ml-1">(Refill Supplier)</span>
                          ) : null}
                        </span>
                      </td>

                      {/* PRICE */}
                      <td className="mac-td font-black text-black text-xs">
                        {formatCurrency(prod.price)}
                      </td>

                      {/* ACTION BUTTONS GROUP */}
                      <td className="mac-td text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* PRIMARY ACTION: RESTOCK ETALASE */}
                          <button
                            onClick={() => onTransfer(prod)}
                            disabled={isWarehouseOut}
                            className="mac-btn px-1.5 py-1 text-xs disabled:opacity-40"
                            title="Restock Etalase (Pindahkan stok dari Gudang ke Etalase Kasir)"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>

                          {/* SECONDARY TOOLBAR GROUP */}
                          <button
                            onClick={() => onRestock(prod)}
                            className="mac-btn px-1.5 py-1 text-xs"
                            title="Tambah Pasokan Baru dari Supplier ke Gudang"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onView(prod)}
                            className="mac-btn px-1.5 py-1 text-xs"
                            title="Lihat Detail Produk"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEdit(prod)}
                            className="mac-btn px-1.5 py-1 text-xs"
                            title="Edit Produk"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDelete(prod)}
                            className="mac-btn px-1.5 py-1 text-xs text-red-700"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-black space-y-2">
            <Warehouse className="w-10 h-10 mx-auto text-gray-600" />
            <p className="text-xs font-black uppercase">
              Tidak ada produk ditemukan
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
