import React from 'react';
import { Modal } from '../common/Modal';
import { Supplier } from '../../pages/SuppliersPage';
import { AlertTriangle } from 'lucide-react';

interface DeleteSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onConfirmDelete: () => void;
}

export const DeleteSupplierModal: React.FC<DeleteSupplierModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onConfirmDelete,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Supplier">
      {supplier && (
        <div className="space-y-4 text-xs font-sans text-black">
          <div className="p-3 bg-red-100 border-2 border-black flex items-center gap-3 font-extrabold">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-700" />
            <span>
              Apakah Anda yakin ingin menghapus <strong>"{supplier.companyName}"</strong> dari kontak supplier?
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
              onClick={onConfirmDelete}
              className="mac-btn flex-1 py-2 text-xs font-black uppercase mac-btn-active text-white bg-red-700"
            >
              Ya, Hapus Supplier
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
