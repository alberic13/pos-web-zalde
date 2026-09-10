import React from 'react';
import { Modal } from '../common/Modal';
import { Product } from '../../types';
import { Save } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface EditCostPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  newCostPrice: number | '';
  setNewCostPrice: (val: number | '') => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const EditCostPriceModal: React.FC<EditCostPriceModalProps> = ({
  isOpen,
  onClose,
  product,
  newCostPrice,
  setNewCostPrice,
  onSubmit,
  submitting,
}) => {

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Harga Modal Produk"
      subtitle={`Produk: ${product?.name || ''}`}
    >
      {product && (
        <form onSubmit={onSubmit} className="space-y-3.5 text-xs font-sans text-black">
          <div className="mac-card p-3 space-y-1">
            <span className="text-[10px] text-gray-800 uppercase font-black block">Harga Jual Etalase</span>
            <span className="text-sm font-black text-black font-mono">{formatCurrency(product.price)}</span>
          </div>

          <div>
            <label className="text-black font-black block mb-1 uppercase">Harga Modal Baru (Rp) *</label>
            <input
              type="number"
              required
              min="0"
              placeholder="Masukkan harga modal beli..."
              value={newCostPrice}
              onChange={(e) => setNewCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-extrabold"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mac-btn w-full py-2.5 text-xs font-black uppercase disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> {submitting ? 'Menyimpan...' : 'Simpan Harga Modal Baru'}
          </button>
        </form>
      )}
    </Modal>
  );
};
