import React from 'react';
import { Product, Category } from '../../types';
import { Modal } from '../common/Modal';
import { Save } from 'lucide-react';

interface ProductFormData {
  sku: string;
  name: string;
  price: string;
  costPrice: string;
  stock: string;
  warehouseStock: string;
  categoryId: string;
  imageUrl: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  formData: ProductFormData;
  onFormDataChange: (data: ProductFormData) => void;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  formData,
  onFormDataChange,
  categories,
  onSubmit,
  submitting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
      subtitle={
        editingProduct
          ? `SKU: ${editingProduct.sku}`
          : 'Lengkapi detail produk etalase dan stok gudang'
      }
    >
      <form onSubmit={onSubmit} className="space-y-3.5 font-sans text-black">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-black text-black block mb-1 uppercase">
              SKU Barang *
            </label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) =>
                onFormDataChange({ ...formData, sku: e.target.value })
              }
              className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-bold"
              placeholder="PRD-123456"
            />
          </div>
          <div>
            <label className="text-xs font-black text-black block mb-1 uppercase">
              Kategori *
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) =>
                onFormDataChange({ ...formData, categoryId: e.target.value })
              }
              className="mac-select w-full text-xs font-bold"
            >
              <option value="" disabled>
                Pilih Kategori
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-black block mb-1 uppercase">
            Nama Produk *
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Mouse Gaming Wireless RGB..."
            value={formData.name}
            onChange={(e) =>
              onFormDataChange({ ...formData, name: e.target.value })
            }
            className="mac-input w-full px-3 py-2 text-xs font-extrabold text-black"
          />
        </div>

        <div>
          <label className="text-xs font-black text-black block mb-1 uppercase">
            Harga Jual *
          </label>
          <input
            type="number"
            required
            min="0"
            placeholder="Rp 0"
            value={formData.price}
            onChange={(e) =>
              onFormDataChange({ ...formData, price: e.target.value })
            }
            className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-extrabold"
          />
        </div>

        <div>
          <label className="text-xs font-black text-black block mb-1 uppercase">
            URL Foto Produk (Opsional)
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            value={formData.imageUrl}
            onChange={(e) =>
              onFormDataChange({ ...formData, imageUrl: e.target.value })
            }
            className="mac-input w-full px-3 py-2 text-xs text-black"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mac-btn w-full py-2.5 text-xs font-black uppercase disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />{' '}
          {submitting
            ? 'Menyimpan...'
            : editingProduct
            ? 'Simpan Perubahan'
            : 'Tambah Produk Sekarang'}
        </button>
      </form>
    </Modal>
  );
};
