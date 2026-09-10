import React from 'react';
import { ToastContainer } from '../components/common/Toast';
import { useInventory } from '../components/inventory/useInventory';
import { InventoryMetricsHeader } from '../components/inventory/InventoryMetricsHeader';
import { InventoryFilterBar } from '../components/inventory/InventoryFilterBar';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { TransferStockModal } from '../components/inventory/TransferStockModal';
import { WarehouseRestockModal } from '../components/inventory/WarehouseRestockModal';
import { ProductFormModal } from '../components/inventory/ProductFormModal';
import { ProductDetailModal } from '../components/inventory/ProductDetailModal';
import { DeleteConfirmModal } from '../components/inventory/DeleteConfirmModal';

export const InventoryPage: React.FC = () => {
  const inv = useInventory();

  return (
    <div className="space-y-5 animate-fade-in font-sans text-black">
      <ToastContainer toasts={inv.toasts} onDismiss={inv.removeToast} />

      {/* Metrics Summary Header */}
      <InventoryMetricsHeader
        totalDisplayStock={inv.totalDisplayStock}
        totalWarehouseStock={inv.totalWarehouseStock}
        lowStockCount={inv.lowStockCount}
        totalAssetValue={inv.totalAssetValue}
      />

      {/* Filter and Action Bar */}
      <InventoryFilterBar
        search={inv.search}
        onSearchChange={inv.setSearch}
        statusFilter={inv.statusFilter}
        onStatusFilterChange={inv.setStatusFilter}
        totalProducts={inv.products.length}
        lowStockCount={inv.lowStockCount}
        onOpenCreateModal={inv.openCreateModal}
      />

      {/* Inventory Table */}
      <InventoryTable
        loading={inv.loading}
        products={inv.filteredProducts}
        onTransfer={inv.openTransferModal}
        onRestock={inv.openRestockModal}
        onView={inv.openDetailModal}
        onEdit={inv.openEditModal}
        onDelete={inv.openDeleteModal}
      />

      {/* Modal 1: Restock Etalase */}
      <TransferStockModal
        isOpen={inv.isTransferModalOpen}
        onClose={() => inv.setIsTransferModalOpen(false)}
        product={inv.transferProduct}
        amount={inv.transferAmount}
        onAmountChange={inv.setTransferAmount}
        onSubmit={inv.handleTransferToDisplay}
        submitting={inv.submitting}
      />

      {/* Modal 2: Pasokan Gudang Baru */}
      <WarehouseRestockModal
        isOpen={inv.isWarehouseRestockOpen}
        onClose={() => inv.setIsWarehouseRestockOpen(false)}
        product={inv.restockProduct}
        qty={inv.warehouseRestockQty}
        onQtyChange={inv.setWarehouseRestockQty}
        onSubmit={inv.handleRestockWarehouse}
        submitting={inv.submitting}
      />

      {/* Modal 3: Create / Edit Product */}
      <ProductFormModal
        isOpen={inv.isProductModalOpen}
        onClose={() => inv.setIsProductModalOpen(false)}
        editingProduct={inv.editingProduct}
        formData={inv.formData}
        onFormDataChange={inv.setFormData}
        categories={inv.categories}
        onSubmit={inv.handleSaveProduct}
        submitting={inv.submitting}
      />

      {/* Modal 4: Confirm Delete */}
      <DeleteConfirmModal
        isOpen={inv.isDeleteModalOpen}
        onClose={() => inv.setIsDeleteModalOpen(false)}
        product={inv.deletingProduct}
        onConfirm={inv.handleDeleteProduct}
        submitting={inv.submitting}
      />

      {/* Modal 5: Detail View */}
      <ProductDetailModal
        isOpen={inv.isDetailModalOpen}
        onClose={() => inv.setIsDetailModalOpen(false)}
        product={inv.viewingProduct}
        onEdit={inv.openEditModal}
      />
    </div>
  );
};

export default InventoryPage;
