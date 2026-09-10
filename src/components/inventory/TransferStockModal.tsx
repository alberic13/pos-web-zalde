import React from 'react';
import { Product } from '../../types';
import { Modal } from '../common/Modal';
import { ArrowRightLeft } from 'lucide-react';

interface TransferStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  amount: number | '';
  onAmountChange: (val: number | '') => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const TransferStockModal: React.FC<TransferStockModalProps> = ({
  isOpen,
  onClose,
  product,
  amount,
  onAmountChange,
  onSubmit,
  submitting,
}) => {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restock Produk ke Etalase Kasir"
      subtitle={`Produk: ${product.name}`}
    >
      <form onSubmit={onSubmit} className="space-y-4 font-sans text-black">
        <div className="grid grid-cols-2 gap-3">
          <div className="mac-card p-3 text-center">
            <span className="text-[10px] text-gray-800 font-extrabold uppercase block mb-0.5">
              Sisa Stok Gudang
            </span>
            <span className="text-base font-black text-black font-mono">
              {product.warehouseStock} Unit
            </span>
          </div>
          <div className="mac-card p-3 text-center">
            <span className="text-[10px] text-gray-800 font-extrabold uppercase block mb-0.5">
              Stok Etalase Saat Ini
            </span>
            <span className="text-base font-black text-black font-mono">
              {product.stock} Unit
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-black block mb-1 uppercase">
            Jumlah Unit Diambil dari Gudang ➔ Etalase *
          </label>
          <input
            type="number"
            required
            min="1"
            max={product.warehouseStock}
            placeholder="Masukkan jumlah unit..."
            value={amount}
            onChange={(e) =>
              onAmountChange(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-extrabold"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || product.warehouseStock <= 0}
          className="mac-btn w-full py-2.5 text-xs font-black uppercase disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ArrowRightLeft className="w-4 h-4" />
          {submitting
            ? 'Memindahkan Stok...'
            : 'Konfirmasi Restock Ke Etalase'}
        </button>
      </form>
    </Modal>
  );
};
