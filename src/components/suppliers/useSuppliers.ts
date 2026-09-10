import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Category } from '../../types';
import { Supplier } from '../../pages/SuppliersPage';
import { ToastMessage } from '../common/Toast';
import { useSupplierModal } from './useSupplierModal';
import { useDeleteSupplier } from './useDeleteSupplier';
import { getErrorMessage } from '../../utils/error';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToasts((prev) => [...prev, { id: Date.now().toString(), type, title, message }]);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const loadData = async () => {
    try {
      setLoading(true);
      const [sups, cats] = await Promise.all([api.getSuppliers(), api.getCategories()]);
      setSuppliers(sups);
      setCategories(cats);
    } catch (err: unknown) {
      addToast('error', 'Gagal memuat data supplier', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const modal = useSupplierModal({
    defaultCategory: categories[0]?.name || '',
    onSuccess: (msg) => addToast('success', 'Berhasil', msg),
    onError: (t, m) => addToast('error', t, m),
    onRefresh: loadData,
  });

  const del = useDeleteSupplier({
    onSuccess: (msg) => addToast('success', 'Supplier Dihapus', msg),
    onError: (t, m) => addToast('error', t, m),
    onRefresh: loadData,
  });

  const filteredSuppliers = suppliers.filter((sup) => {
    const s = search.toLowerCase();
    const match = !search.trim() || sup.companyName.toLowerCase().includes(s) || sup.contactPerson.toLowerCase().includes(s) || sup.categorySupply.toLowerCase().includes(s);
    if (!match) return false;
    if (selectedCategory !== 'all' && sup.categorySupply !== selectedCategory) return false;
    return true;
  });

  return {
    suppliers,
    categories,
    loading,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    filteredSuppliers,
    toasts,
    removeToast,
    modal,
    del,
  };
}
