import React from 'react';
import { Modal } from '../common/Modal';
import { Category } from '../../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Category | null;
  name: string;
  setName: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  editingCategory,
  name,
  setName,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-black text-black block mb-1 uppercase">Nama Kategori *</label>
          <input
            type="text"
            required
            placeholder="Contoh: Makanan, Minuman, Snort"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mac-input w-full px-3 py-2 text-xs font-extrabold text-black"
          />
        </div>
        <button type="submit" className="mac-btn w-full py-2.5 text-xs font-black uppercase tracking-wider">
          Simpan Kategori
        </button>
      </form>
    </Modal>
  );
};
