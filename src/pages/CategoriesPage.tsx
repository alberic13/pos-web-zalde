import React from 'react';
import { ToastContainer } from '../components/common/Toast';
import { useCategories } from '../components/categories/useCategories';
import { CategoryCardGrid } from '../components/categories/CategoryCardGrid';
import { CategoryFormModal } from '../components/categories/CategoryFormModal';
import { CategoryDeleteModal } from '../components/categories/CategoryDeleteModal';
import { Plus } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const {
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
  } = useCategories();

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl font-sans text-black">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

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

      <CategoryCardGrid
        loading={loading}
        categories={categories}
        onEdit={handleOpenEdit}
        onDelete={(cat) => {
          setDeletingCategory(cat);
          setIsDeleteModalOpen(true);
        }}
      />

      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        editingCategory={editingCategory}
        name={name}
        setName={setName}
        onSubmit={handleSubmit}
      />

      <CategoryDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        category={deletingCategory}
        onConfirmDelete={handleDelete}
      />
    </div>
  );
};
