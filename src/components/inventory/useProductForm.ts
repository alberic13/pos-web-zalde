import { useState } from 'react';
import { api } from '../../lib/api';
import { Product, Category } from '../../types';

interface UseProductFormProps {
  categories: Category[];
  onSuccess: (type: 'create' | 'update', name: string) => void;
  onError: (title: string, message: string) => void;
  refreshData: () => Promise<void>;
}

export function useProductForm({
  categories,
  onSuccess,
  onError,
  refreshData,
}: UseProductFormProps) {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
    costPrice: '',
    stock: '',
    warehouseStock: '',
    categoryId: '',
    imageUrl: '',
  });

  const generateSku = () =>
    `PRD-${Math.floor(100000 + Math.random() * 900000)}`;

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: generateSku(),
      name: '',
      price: '',
      costPrice: '',
      stock: '5',
      warehouseStock: '20',
      categoryId: categories[0]?.id || '',
      imageUrl: '',
    });
    setIsProductModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      price: prod.price.toString(),
      costPrice: prod.costPrice ? prod.costPrice.toString() : '',
      stock: prod.stock.toString(),
      warehouseStock: prod.warehouseStock.toString(),
      categoryId: prod.categoryId,
      imageUrl: prod.imageUrl || '',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      onError('Form Tidak Lengkap', 'Harap isi Nama, Harga Jual, dan Kategori.');
      return;
    }

    const payload = {
      sku: formData.sku.trim() || generateSku(),
      name: formData.name.trim(),
      price: Number(formData.price),
      costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
      stock: editingProduct ? editingProduct.stock : Number(formData.stock || 0),
      warehouseStock: editingProduct
        ? editingProduct.warehouseStock
        : Number(formData.warehouseStock || 0),
      categoryId: formData.categoryId,
      imageUrl: formData.imageUrl.trim() || undefined,
    };

    try {
      setSubmitting(true);
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        onSuccess('update', payload.name);
      } else {
        await api.createProduct(payload);
        onSuccess('create', payload.name);
      }
      setIsProductModalOpen(false);
      await refreshData();
    } catch (err: any) {
      onError('Gagal Menyimpan Produk', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isProductModalOpen,
    setIsProductModalOpen,
    editingProduct,
    formData,
    setFormData,
    submitting,
    openCreateModal,
    openEditModal,
    handleSaveProduct,
  };
}
