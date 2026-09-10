import { useState } from 'react';
import { api } from '../../lib/api';
import { Product } from '../../types';

interface UseEditCostPriceProps {
  onSuccess: (msg: string) => void;
  onError: (title: string, msg?: string) => void;
  onRefresh: () => void;
  getCostPrice: (prod: Product) => number;
}

export function useEditCostPrice({ onSuccess, onError, onRefresh, getCostPrice }: UseEditCostPriceProps) {
  const [isEditCostModalOpen, setIsEditCostModalOpen] = useState(false);
  const [costProduct, setCostProduct] = useState<Product | null>(null);
  const [newCostPrice, setNewCostPrice] = useState<number | ''>('');
  const [submittingCost, setSubmittingCost] = useState(false);

  const openEditCostModal = (prod: Product) => {
    setCostProduct(prod);
    setNewCostPrice(getCostPrice(prod));
    setIsEditCostModalOpen(true);
  };

  const closeEditCostModal = () => {
    setIsEditCostModalOpen(false);
    setCostProduct(null);
  };

  const handleSaveCostPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!costProduct || newCostPrice === '') return;

    const val = Number(newCostPrice);
    if (isNaN(val) || val < 0) {
      onError('Harga Modal Tidak Valid', 'Masukkan angka harga modal yang valid.');
      return;
    }

    try {
      setSubmittingCost(true);
      await api.updateProduct(costProduct.id, {
        sku: costProduct.sku,
        name: costProduct.name,
        price: costProduct.price,
        costPrice: val,
        stock: costProduct.stock,
        warehouseStock: costProduct.warehouseStock,
        categoryId: costProduct.categoryId,
        imageUrl: costProduct.imageUrl || undefined,
      });

      onSuccess(`Harga modal untuk "${costProduct.name}" berhasil diperbarui.`);
      closeEditCostModal();
      onRefresh();
    } catch (err: any) {
      onError('Gagal Memperbarui Harga Modal', err.message);
    } finally {
      setSubmittingCost(false);
    }
  };

  return {
    isEditCostModalOpen,
    costProduct,
    newCostPrice,
    setNewCostPrice,
    submittingCost,
    openEditCostModal,
    closeEditCostModal,
    handleSaveCostPrice,
  };
}
