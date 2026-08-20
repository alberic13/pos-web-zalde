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
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Kategori Produk</h2>
          <p className="text-xs text-slate-500">Kelola kelompok produk di katalog toko Anda</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#7a35ff] hover:bg-[#6825e6] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-[#7a35ff]/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Tambah Kategori
        </button>
      </div>

      {/* Categories Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse p-4" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-slate-200/80 hover:border-[#7a35ff]/40 hover:shadow-violet p-4 rounded-2xl flex items-center justify-between transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f3eeff] text-[#7a35ff] flex items-center justify-center border border-[#d1adff]/40">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                  <span className="text-xs text-slate-500">
                    {cat.productCount || 0} Produk terkait
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 text-slate-400 hover:text-[#7a35ff] hover:bg-[#f3eeff] rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setDeletingCategory(cat);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-xs text-slate-500">
          <FolderTree className="w-12 h-12 mx-auto opacity-40 mb-2" />
          <p className="text-sm font-semibold">Belum ada kategori</p>
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
            <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Kategori *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Makanan, Minuman, Snort"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f0f2f5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#7a35ff] focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#7a35ff] hover:bg-[#6825e6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#7a35ff]/25"
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
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <p className="text-xs">
              Apakah Anda yakin ingin menghapus kategori <strong>"{deletingCategory?.name}"</strong>?
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
