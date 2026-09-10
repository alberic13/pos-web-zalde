import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Category } from '../../types';
import { ToastMessage } from '../common/Toast';
import { getErrorMessage } from '../../utils/error';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToasts((prev) => [...prev, { id: Date.now().toString(), type, title, message }]);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategories(data);
    } catch (err: unknown) {
      addToast('error', 'Gagal memuat kategori', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, name);
        addToast('success', 'Kategori Diperbarui', `Kategori "${name}" berhasil diupdate.`);
      } else {
        await api.createCategory(name);
        addToast('success', 'Kategori Ditambahkan', `Kategori "${name}" berhasil dibuat.`);
      }
      setIsFormModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      addToast('error', 'Gagal Menyimpan Kategori', getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await api.deleteCategory(deletingCategory.id);
      addToast('success', 'Kategori Dihapus', `Kategori "${deletingCategory.name}" telah dihapus.`);
      setIsDeleteModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      addToast('error', 'Gagal Menghapus Kategori', getErrorMessage(err));
    }
  };

  return {
    categories,
    loading,
    name,
    setName,
    editingCategory,
    deletingCategory,
    setDeletingCategory,
    isFormModalOpen,
    setIsFormModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    toasts,
    removeToast,
    handleOpenAdd,
    handleOpenEdit,
    handleSubmit,
    handleDelete,
  };
}
