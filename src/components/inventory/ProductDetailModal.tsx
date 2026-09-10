import React from 'react';
import { Product } from '../../types';
import { Modal } from '../common/Modal';
import { ProductImage } from '../common/ProductImage';
import { Edit3 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit: (prod: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit,
}) => {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Stok & Produk"
      subtitle={`SKU: ${product.sku}`}
    >
      <div className="space-y-3.5 text-xs font-sans text-black">
        <div className="flex gap-3.5 items-center mac-card p-3">
          <div className="w-14 h-14 bg-gray-200 border border-black overflow-hidden shrink-0 flex items-center justify-center">
            <ProductImage src={product.imageUrl} alt={product.name} />
          </div>
          <div>
            <h4 className="text-sm font-black text-black">{product.name}</h4>
            <p className="text-xs font-bold text-gray-700 mt-0.5">
              {product.category?.name || 'Kategori'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="mac-card p-3">
            <span className="text-[10px] text-gray-800 block uppercase font-black mb-1">
              Stok Etalase
            </span>
            <span className="text-base font-black text-black font-mono">
              {product.stock} Unit
            </span>
          </div>
          <div className="mac-card p-3">
            <span className="text-[10px] text-gray-800 block uppercase font-black mb-1">
              Stok Gudang
            </span>
            <span className="text-base font-black text-black font-mono">
              {product.warehouseStock} Unit
            </span>
          </div>
        </div>

        <div className="mac-card p-3">
          <span className="text-[10px] text-gray-800 block uppercase font-black mb-1">
            Harga Jual
          </span>
          <span className="text-base font-black text-black font-mono">
            {formatCurrency(product.price)}
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            className="mac-btn px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4" /> Edit Informasi Produk
          </button>
        </div>
      </div>
    </Modal>
  );
};
