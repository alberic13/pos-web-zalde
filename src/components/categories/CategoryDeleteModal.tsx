import React from 'react';
import { Modal } from '../common/Modal';
import { Category } from '../../types';
import { AlertCircle } from 'lucide-react';

interface CategoryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onConfirmDelete: () => void;
}

export const CategoryDeleteModal: React.FC<CategoryDeleteModalProps> = ({
  isOpen,
  onClose,
  category,
  onConfirmDelete,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Kategori">
      <div className="space-y-4 font-sans text-black">
        <div className="flex items-center gap-3 bg-red-100 p-3 border-2 border-black">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-700" />
          <p className="text-xs font-extrabold">
            Apakah Anda yakin ingin menghapus kategori <strong>"{category?.name}"</strong>?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="mac-btn flex-1 py-2 text-xs font-black uppercase"
          >
            Batal
          </button>
          <button
            onClick={onConfirmDelete}
            className="mac-btn flex-1 py-2 text-xs font-black uppercase mac-btn-active text-white bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </Modal>
  );
};
