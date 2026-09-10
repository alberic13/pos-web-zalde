import { useState } from 'react';
import { api } from '../../lib/api';
import { Product } from '../../types';

interface UseStockTransferProps {
  onSuccess: (title: string, message: string) => void;
  onError: (title: string, message: string) => void;
  refreshData: () => Promise<void>;
}

export function useStockTransfer({
  onSuccess,
  onError,
  refreshData,
}: UseStockTransferProps) {
  const [submitting, setSubmitting] = useState(false);

  // 1. Transfer Gudang -> Etalase
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferProduct, setTransferProduct] = useState<Product | null>(null);
  const [transferAmount, setTransferAmount] = useState<number | ''>(5);

  const openTransferModal = (prod: Product) => {
    setTransferProduct(prod);
    setTransferAmount(prod.warehouseStock > 0 ? Math.min(10, prod.warehouseStock) : 1);
    setIsTransferModalOpen(true);
  };

  const handleTransferToDisplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProduct || transferAmount === '') return;

    const amount = Number(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      onError('Jumlah Tidak Valid', 'Masukkan angka transfer yang valid.');
      return;
    }

    if (amount > transferProduct.warehouseStock) {
      onError('Stok Gudang Tidak Cukup', `Sisa stok di gudang hanya ${transferProduct.warehouseStock} unit.`);
      return;
    }

    try {
      setSubmitting(true);
      await api.transferToDisplay(transferProduct.id, amount);
      onSuccess('Restock Etalase Berhasil!', `${amount} unit "${transferProduct.name}" berhasil dipindahkan dari Gudang ke Etalase Kasir.`);
      setIsTransferModalOpen(false);
      await refreshData();
    } catch (err: any) {
      onError('Gagal Memindahkan Stok', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Tambah Pasokan Masuk Gudang
  const [isWarehouseRestockOpen, setIsWarehouseRestockOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [warehouseRestockQty, setWarehouseRestockQty] = useState<number | ''>(10);

  const openRestockModal = (prod: Product) => {
    setRestockProduct(prod);
    setWarehouseRestockQty(10);
    setIsWarehouseRestockOpen(true);
  };

  const handleRestockWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct || warehouseRestockQty === '') return;

    const qty = Number(warehouseRestockQty);
    if (isNaN(qty) || qty <= 0) {
      onError('Jumlah Tidak Valid', 'Masukkan angka pasokan yang valid.');
      return;
    }

    try {
      setSubmitting(true);
      await api.updateProduct(restockProduct.id, {
        sku: restockProduct.sku,
        name: restockProduct.name,
        price: restockProduct.price,
        costPrice: restockProduct.costPrice || undefined,
        stock: restockProduct.stock,
        warehouseStock: restockProduct.warehouseStock + qty,
        categoryId: restockProduct.categoryId,
        imageUrl: restockProduct.imageUrl || undefined,
      });

      onSuccess('Pasokan Gudang Bertambah!', `Stok cadangan gudang "${restockProduct.name}" bertambah +${qty} unit.`);
      setIsWarehouseRestockOpen(false);
      await refreshData();
    } catch (err: any) {
      onError('Gagal Menambah Pasokan Gudang', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    isTransferModalOpen,
    setIsTransferModalOpen,
    transferProduct,
    transferAmount,
    setTransferAmount,
    openTransferModal,
    handleTransferToDisplay,
    isWarehouseRestockOpen,
    setIsWarehouseRestockOpen,
    restockProduct,
    warehouseRestockQty,
    setWarehouseRestockQty,
    openRestockModal,
    handleRestockWarehouse,
  };
}
