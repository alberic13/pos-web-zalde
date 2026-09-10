import React from 'react';
import { Product } from '../../types';
import { Supplier } from '../../pages/SuppliersPage';
import { ProductImage } from '../common/ProductImage';
import { TableSkeleton } from '../common/Skeleton';
import { MessageCircle, Boxes, Minus, Plus, Edit3 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface SupplierOrderTableProps {
  loading: boolean;
  products: Product[];
  suppliers: Supplier[];
  selectedSupplierMap: Record<string, string>;
  orderQtyMap: Record<string, number>;
  onSupplierChange: (productId: string, supplierId: string) => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onSetQtyDirect: (productId: string, val: string) => void;
  onOpenEditCost: (prod: Product) => void;
  onDirectWhatsApp: (prod: Product) => void;
  getCostPrice: (prod: Product) => number;
}

export const SupplierOrderTable: React.FC<SupplierOrderTableProps> = ({
  loading,
  products,
  suppliers,
  selectedSupplierMap,
  orderQtyMap,
  onSupplierChange,
  onUpdateQty,
  onSetQtyDirect,
  onOpenEditCost,
  onDirectWhatsApp,
  getCostPrice,
}) => {

  return (
    <div className="mac-window p-0 overflow-hidden">
      <div className="mac-window-header">
        <h3 className="text-xs font-black uppercase text-black">
          Daftar Restock Barang ke Supplier (Purchase Order)
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
                  <th className="mac-th">Supplier Tujuan</th>
                  <th className="mac-th">Stok Gudang</th>
                  <th className="mac-th">Harga Modal</th>
                  <th className="mac-th">Harga Jual</th>
                  <th className="mac-th text-center min-w-[120px]">Tambah Qty</th>
                  <th className="mac-th">Total Bayar</th>
                  <th className="mac-th text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => {
                  const isOut = prod.warehouseStock <= 0;
                  const isLow = prod.warehouseStock <= 5;
                  const costPrice = getCostPrice(prod);
                  const currentQty = orderQtyMap[prod.id] || 10;
                  const totalToPay = costPrice * currentQty;
                  const activeSupplierId = selectedSupplierMap[prod.id] || suppliers[0]?.id || '';

                  return (
                    <tr key={prod.id} className="mac-tr">
                      <td className="mac-td">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 border border-black overflow-hidden shrink-0 flex items-center justify-center">
                            <ProductImage src={prod.imageUrl} alt={prod.name} />
                          </div>
                          <div>
                            <span className="font-extrabold text-black block text-xs line-clamp-1">{prod.name}</span>
                            <span className="text-[10px] text-gray-700 font-mono">{prod.sku} • {prod.category?.name || 'Kategori'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="mac-td min-w-[180px]">
                        <select
                          value={activeSupplierId}
                          onChange={(e) => onSupplierChange(prod.id, e.target.value)}
                          className="mac-select w-full text-xs font-bold"
                        >
                          {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.companyName}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="mac-td whitespace-nowrap">
                        <span className={`mac-badge ${isOut ? 'mac-badge-rose' : isLow ? 'mac-badge-amber' : 'mac-badge-indigo'}`}>
                          <span>{prod.warehouseStock} Unit</span>
                        </span>
                      </td>

                      <td className="mac-td font-mono text-black font-bold text-xs whitespace-nowrap">
                        {formatCurrency(costPrice)}
                      </td>

                      <td className="mac-td font-mono text-black font-black text-xs whitespace-nowrap">
                        {formatCurrency(prod.price)}
                      </td>

                      <td className="mac-td text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(prod.id, -5)}
                            className="mac-btn px-1.5 py-0.5 text-xs font-black"
                            title="-5 Unit"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={currentQty}
                            onChange={(e) => onSetQtyDirect(prod.id, e.target.value)}
                            className="mac-input w-12 text-center text-xs font-mono font-black text-black py-0.5"
                          />
                          <button
                            type="button"
                            onClick={() => onUpdateQty(prod.id, 5)}
                            className="mac-btn px-1.5 py-0.5 text-xs font-black"
                            title="+5 Unit"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="mac-td font-mono text-black font-black text-xs whitespace-nowrap">
                        {formatCurrency(totalToPay)}
                      </td>

                      <td className="mac-td text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenEditCost(prod)}
                            className="mac-btn px-2 py-1 text-xs"
                            title="Edit Harga Modal (Beli) Produk Ini"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDirectWhatsApp(prod)}
                            className="mac-btn px-2.5 py-1 text-[10px] font-black uppercase flex items-center gap-1"
                            title="Hubungi Supplier via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700" /> Order WA
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
            <Boxes className="w-10 h-10 mx-auto text-gray-600" />
            <p className="text-xs font-black uppercase">Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
};
