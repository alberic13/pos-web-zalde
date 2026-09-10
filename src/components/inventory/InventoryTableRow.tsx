import React from 'react';
import { Product } from '../../types';
import { ProductImage } from './ProductImage';
import { ArrowRightLeft, Plus, Eye, Edit3, Trash2 } from 'lucide-react';

interface InventoryTableRowProps {
  product: Product;
  formatCurrency: (val: number) => string;
  onTransfer: (prod: Product) => void;
  onRestock: (prod: Product) => void;
  onView: (prod: Product) => void;
  onEdit: (prod: Product) => void;
  onDelete: (prod: Product) => void;
}

export const InventoryTableRow: React.FC<InventoryTableRowProps> = ({
  product,
  formatCurrency,
  onTransfer,
  onRestock,
  onView,
  onEdit,
  onDelete,
}) => {
  const isDisplayLow = product.stock <= 5;
  const isWarehouseOut = product.warehouseStock <= 0;
  const isWarehouseLow = product.warehouseStock <= 5;

  return (
    <tr className="mac-tr">
      <td className="mac-td">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 border border-black overflow-hidden shrink-0 flex items-center justify-center">
            <ProductImage src={product.imageUrl} alt={product.name} />
          </div>
          <div>
            <span className="font-extrabold text-black block text-xs">{product.name}</span>
            <span className="text-[10px] text-gray-700 font-semibold">{product.category?.name || 'Uncategorized'}</span>
          </div>
        </div>
      </td>

      <td className="mac-td font-mono font-bold text-xs">{product.sku}</td>

      <td className="mac-td whitespace-nowrap">
        <span
          className={`mac-badge ${
            product.stock <= 0 ? 'mac-badge-rose' : isDisplayLow ? 'mac-badge-amber' : 'mac-badge-emerald'
          }`}
        >
          <span>{product.stock} Unit</span>
          {isDisplayLow && <span className="ml-1">(Refill)</span>}
        </span>
      </td>

      <td className="mac-td whitespace-nowrap">
        <span
          className={`mac-badge ${
            isWarehouseOut ? 'mac-badge-rose' : isWarehouseLow ? 'mac-badge-amber' : 'mac-badge-indigo'
          }`}
        >
          <span>{product.warehouseStock} Unit</span>
          {isWarehouseOut ? (
            <span className="ml-1">(Kosong)</span>
          ) : isWarehouseLow ? (
            <span className="ml-1">(Refill Supplier)</span>
          ) : null}
        </span>
      </td>

      <td className="mac-td font-black text-black text-xs">{formatCurrency(product.price)}</td>

      <td className="mac-td text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onTransfer(product)}
            disabled={isWarehouseOut}
            className="mac-btn px-1.5 py-1 text-xs disabled:opacity-40"
            title="Restock Etalase (Pindahkan stok dari Gudang ke Etalase Kasir)"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onRestock(product)}
            className="mac-btn px-1.5 py-1 text-xs"
            title="Tambah Pasokan Baru dari Supplier ke Gudang"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onView(product)}
            className="mac-btn px-1.5 py-1 text-xs"
            title="Lihat Detail Produk"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onEdit(product)}
            className="mac-btn px-1.5 py-1 text-xs"
            title="Edit Produk"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(product)}
            className="mac-btn px-1.5 py-1 text-xs text-red-700"
            title="Hapus Produk"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
