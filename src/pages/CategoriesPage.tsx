import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Category } from '../types';
import { Modal } from '../components/common/Modal';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Plus, Edit2, Trash2, FolderTree, AlertCircle } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategories(data);
    } catch (err: any) {
      addToast('error', 'Gagal memuat kategori', err.message);
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
    } catch (err: any) {
      addToast('error', 'Gagal Menyimpan Kategori', err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await api.deleteCategory(deletingCategory.id);
      addToast('success', 'Kategori Dihapus', `Kategori "${deletingCategory.name}" telah dihapus.`);
      setIsDeleteModalOpen(false);
      loadCategories();
    } catch (err: any) {
      addToast('error', 'Gagal Menghapus Kategori', err.message);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl font-sans text-black">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header Window Bar */}
      <div className="mac-window p-3 sm:p-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-black uppercase">Kategori Produk</h2>
          <p className="text-[11px] text-gray-800 font-semibold">Kelola kelompok produk di katalog toko Anda</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="mac-btn px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Tambah Kategori
        </button>
      </div>

      {/* Categories Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 mac-card p-4 animate-pulse" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="mac-card p-3.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white border border-black flex items-center justify-center font-bold">
                  <FolderTree className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-black">{cat.name}</h4>
                  <span className="text-[10px] text-gray-800 font-bold">
                    {cat.productCount || 0} Produk terkait
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="mac-btn px-2 py-1 text-xs"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setDeletingCategory(cat);
                    setIsDeleteModalOpen(true);
                  }}
                  className="mac-btn px-2 py-1 text-xs text-red-700"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 mac-window p-6 text-black space-y-2">
          <FolderTree className="w-10 h-10 mx-auto text-gray-600 mb-1" />
          <p className="text-xs font-black uppercase">Belum ada kategori</p>
        </div>
      )}

      {/* FORM MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button
            type="submit"
            className="mac-btn w-full py-2.5 text-xs font-black uppercase tracking-wider"
          >
            Simpan Kategori
          </button>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Kategori"
      >
        <div className="space-y-4 font-sans text-black">
          <div className="flex items-center gap-3 bg-red-100 p-3 border-2 border-black">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-700" />
            <p className="text-xs font-extrabold">
              Apakah Anda yakin ingin menghapus kategori <strong>"{deletingCategory?.name}"</strong>?
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="mac-btn flex-1 py-2 text-xs font-black uppercase"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="mac-btn flex-1 py-2 text-xs font-black uppercase mac-btn-active text-white bg-red-700"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
