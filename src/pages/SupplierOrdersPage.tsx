import React from 'react';
import { ToastContainer } from '../components/common/Toast';
import { useSupplierOrders } from '../components/supplier-orders/useSupplierOrders';
import { SupplierOrderKpis } from '../components/supplier-orders/SupplierOrderKpis';
import { SupplierOrderFilterBar } from '../components/supplier-orders/SupplierOrderFilterBar';
import { SupplierOrderTable } from '../components/supplier-orders/SupplierOrderTable';
import { EditCostPriceModal } from '../components/supplier-orders/EditCostPriceModal';

export const SupplierOrdersPage: React.FC = () => {
  const {
    products,
    suppliers,
    loading,
    search,
    setSearch,
    filterMode,
    setFilterMode,
    selectedSupplierMap,
    orderQtyMap,
    toasts,
    removeToast,
    getCostPrice,
    updateQty,
    setQtyDirect,
    handleSupplierChange,
    directWhatsAppOrder,
    editCost,
    filteredProducts,
    totalWarehouseStock,
    lowWarehouseCount,
    totalOrderValue,
  } = useSupplierOrders();

  return (
    <div className="space-y-5 animate-fade-in font-sans text-black">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <SupplierOrderKpis
        supplierCount={suppliers.length}
        totalWarehouseStock={totalWarehouseStock}
        lowWarehouseCount={lowWarehouseCount}
        totalOrderValue={totalOrderValue}
      />

      <SupplierOrderFilterBar
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        productCount={products.length}
        lowWarehouseCount={lowWarehouseCount}
        search={search}
        setSearch={setSearch}
      />

      <SupplierOrderTable
        loading={loading}
        products={filteredProducts}
        suppliers={suppliers}
        selectedSupplierMap={selectedSupplierMap}
        orderQtyMap={orderQtyMap}
        onSupplierChange={handleSupplierChange}
        onUpdateQty={updateQty}
        onSetQtyDirect={setQtyDirect}
        onOpenEditCost={editCost.openEditCostModal}
        onDirectWhatsApp={directWhatsAppOrder}
        getCostPrice={getCostPrice}
      />

      <EditCostPriceModal
        isOpen={editCost.isEditCostModalOpen}
        onClose={editCost.closeEditCostModal}
        product={editCost.costProduct}
        newCostPrice={editCost.newCostPrice}
        setNewCostPrice={editCost.setNewCostPrice}
        onSubmit={editCost.handleSaveCostPrice}
        submitting={editCost.submittingCost}
      />
    </div>
  );
};
