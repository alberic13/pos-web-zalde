import React from 'react';
import { ToastContainer } from '../components/common/Toast';
import { useSuppliers } from '../components/suppliers/useSuppliers';
import { SupplierKpiCards } from '../components/suppliers/SupplierKpiCards';
import { SupplierFilterHeader } from '../components/suppliers/SupplierFilterHeader';
import { SupplierCardGrid } from '../components/suppliers/SupplierCardGrid';
import { SupplierFormModal } from '../components/suppliers/SupplierFormModal';
import { DeleteSupplierModal } from '../components/suppliers/DeleteSupplierModal';

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address?: string;
  categorySupply: string;
  notes?: string;
}

export const SuppliersPage: React.FC = () => {
  const {
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
  } = useSuppliers();

  return (
    <div className="space-y-5 animate-fade-in font-sans text-black">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <SupplierKpiCards
        supplierCount={suppliers.length}
        categoryCount={categories.length}
      />

      <SupplierFilterHeader
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        onOpenCreate={modal.openCreate}
      />

      <SupplierCardGrid
        loading={loading}
        suppliers={filteredSuppliers}
        onEdit={modal.openEdit}
        onDelete={del.openDelete}
      />

      <SupplierFormModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        editingSupplier={modal.editingSupplier}
        form={modal.form}
        setForm={modal.setForm}
        categories={categories}
        onSubmit={modal.handleSave}
      />

      <DeleteSupplierModal
        isOpen={del.isOpen}
        onClose={del.close}
        supplier={del.deletingSupplier}
        onConfirmDelete={del.handleDelete}
      />
    </div>
  );
};
