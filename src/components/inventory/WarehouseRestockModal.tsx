import React from 'react';
import { Product } from '../../types';
import { Modal } from '../common/Modal';
import { Boxes } from 'lucide-react';

interface WarehouseRestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  qty: number | '';
  onQtyChange: (val: number | '') => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const WarehouseRestockModal: React.FC<WarehouseRestockModalProps> = ({
  isOpen,
  onClose,
  product,
  qty,
  onQtyChange,
  onSubmit,
  submitting,
}) => {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Pasokan Baru ke Gudang"
      subtitle={`Produk: ${product.name}`}
    >
      <form onSubmit={onSubmit} className="space-y-4 font-sans text-black">
        <div className="mac-card p-3 text-xs flex justify-between items-center font-bold">
          <span>Stok Cadangan Gudang Saat Ini:</span>
          <span className="font-mono font-black text-black text-sm">
            {product.warehouseStock} Unit
          </span>
        </div>

        <div>
          <label className="text-xs font-black text-black block mb-1 uppercase">
            Jumlah Unit Baru Masuk Gudang *
          </label>
          <input
            type="number"
            required
            min="1"
            placeholder="Masukkan jumlah unit dari supplier..."
            value={qty}
            onChange={(e) =>
              onQtyChange(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-extrabold"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mac-btn w-full py-2.5 text-xs font-black uppercase disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Boxes className="w-4 h-4" />
          {submitting ? 'Menyimpan...' : 'Simpan Pasokan Masuk Gudang'}
        </button>
      </form>
    </Modal>
  );
};
