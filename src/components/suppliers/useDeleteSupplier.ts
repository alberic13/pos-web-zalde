import { useState } from 'react';
import { api } from '../../lib/api';
import { Supplier } from '../../pages/SuppliersPage';

interface UseDeleteSupplierProps {
  onSuccess: (msg: string) => void;
  onError: (title: string, msg?: string) => void;
  onRefresh: () => void;
}

export function useDeleteSupplier({ onSuccess, onError, onRefresh }: UseDeleteSupplierProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  const openDelete = (sup: Supplier) => {
    setDeletingSupplier(sup);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setDeletingSupplier(null);
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    try {
      await api.deleteSupplier(deletingSupplier.id);
      onSuccess(`Supplier "${deletingSupplier.companyName}" telah dihapus.`);
      close();
      onRefresh();
    } catch (err: any) {
      onError('Gagal Menghapus Supplier', err.message);
    }
  };

  return {
    isOpen,
    deletingSupplier,
    openDelete,
    close,
    handleDelete,
  };
}
