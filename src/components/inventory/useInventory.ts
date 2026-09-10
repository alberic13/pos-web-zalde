import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { Product, Category } from '../../types';
import { ToastMessage } from '../common/Toast';
import { useProductForm } from './useProductForm';
import { useStockTransfer } from './useStockTransfer';
import { getErrorMessage } from '../../utils/error';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low_display' | 'out_warehouse' | 'safe'>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal 4: Delete Product
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deletingSubmitting, setDeletingSubmitting] = useState(false);

  // Modal 5: Detail View
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        api.getProducts(search),
        api.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: unknown) {
      addToast('error', 'Gagal memuat data gudang', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Product Form Sub-hook
  const productForm = useProductForm({
    categories,
    onSuccess: (type, name) => {
      addToast(
        'success',
        type === 'update' ? 'Produk Diperbarui!' : 'Produk Ditambahkan!',
        `Produk "${name}" berhasil ${type === 'update' ? 'diupdate' : 'ditambahkan'}.`
      );
    },
    onError: (title, msg) => addToast('error', title, msg),
    refreshData: loadData,
  });

  // Stock Transfer & Restock Sub-hook
  const stockActions = useStockTransfer({
    onSuccess: (title, msg) => addToast('success', title, msg),
    onError: (title, msg) => addToast('error', title, msg),
    refreshData: loadData,
  });

  // Delete Action
  const openDeleteModal = (prod: Product) => {
    setDeletingProduct(prod);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      setDeletingSubmitting(true);
      await api.deleteProduct(deletingProduct.id);
      addToast('success', 'Produk Dihapus!', `Produk "${deletingProduct.name}" telah dihapus.`);
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
      await loadData();
    } catch (err: unknown) {
      addToast('error', 'Gagal Menghapus Produk', getErrorMessage(err));
    } finally {
      setDeletingSubmitting(false);
    }
  };

  // Detail Action
  const openDetailModal = (prod: Product) => {
    setViewingProduct(prod);
    setIsDetailModalOpen(true);
  };

  // Computed Filters & Metrics
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'low_display') return p.stock <= 5 || p.warehouseStock <= 5;
    if (statusFilter === 'out_warehouse') return p.warehouseStock <= 0;
    if (statusFilter === 'safe') return p.stock > 5 && p.warehouseStock > 5;
    return true;
  });

  const totalDisplayStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalWarehouseStock = products.reduce((sum, p) => sum + p.warehouseStock, 0);
  const lowStockCount = products.filter((p) => p.stock <= 5 || p.warehouseStock <= 5).length;
  const totalAssetValue = products.reduce((sum, p) => sum + p.price * (p.stock + p.warehouseStock), 0);

  return {
    products,
    categories,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    submitting: productForm.submitting || stockActions.submitting || deletingSubmitting,
    toasts,
    removeToast,
    filteredProducts,
    totalDisplayStock,
    totalWarehouseStock,
    lowStockCount,
    totalAssetValue,
    // Transfer modal
    isTransferModalOpen: stockActions.isTransferModalOpen,
    setIsTransferModalOpen: stockActions.setIsTransferModalOpen,
    transferProduct: stockActions.transferProduct,
    transferAmount: stockActions.transferAmount,
    setTransferAmount: stockActions.setTransferAmount,
    openTransferModal: stockActions.openTransferModal,
    handleTransferToDisplay: stockActions.handleTransferToDisplay,
    // Restock modal
    isWarehouseRestockOpen: stockActions.isWarehouseRestockOpen,
    setIsWarehouseRestockOpen: stockActions.setIsWarehouseRestockOpen,
    restockProduct: stockActions.restockProduct,
    warehouseRestockQty: stockActions.warehouseRestockQty,
    setWarehouseRestockQty: stockActions.setWarehouseRestockQty,
    openRestockModal: stockActions.openRestockModal,
    handleRestockWarehouse: stockActions.handleRestockWarehouse,
    // Product form modal
    isProductModalOpen: productForm.isProductModalOpen,
    setIsProductModalOpen: productForm.setIsProductModalOpen,
    editingProduct: productForm.editingProduct,
    formData: productForm.formData,
    setFormData: productForm.setFormData,
    openCreateModal: productForm.openCreateModal,
    openEditModal: productForm.openEditModal,
    handleSaveProduct: productForm.handleSaveProduct,
    // Delete modal
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    deletingProduct,
    openDeleteModal,
    handleDeleteProduct,
    // Detail modal
    isDetailModalOpen,
    setIsDetailModalOpen,
    viewingProduct,
    openDetailModal,
  };
}
