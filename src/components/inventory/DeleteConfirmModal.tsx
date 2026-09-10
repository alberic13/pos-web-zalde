import React from 'react';
import { Product } from '../../types';
import { Modal } from '../common/Modal';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: () => void;
  submitting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
  submitting,
}) => {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Hapus Produk">
      <div className="space-y-4 font-sans text-black">
        <div className="p-3 bg-red-100 border-2 border-black flex items-center gap-3 text-xs font-extrabold">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-700" />
          <span>
            Produk <strong>"{product.name}"</strong> akan dihapus permanen.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="mac-btn flex-1 py-2 text-xs font-black uppercase"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className="mac-btn flex-1 py-2 text-xs font-black uppercase mac-btn-active text-white bg-red-700"
          >
            {submitting ? 'Menghapus...' : 'Ya, Hapus Produk'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
