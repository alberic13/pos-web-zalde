import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Product, Category } from '../types';
import { TableSkeleton } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { compressImageToWebP } from '../lib/imageCompressor';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react';

const ProductImage: React.FC<{ src?: string | null; alt: string; className?: string }> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
}) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
        <ImageIcon className="w-4 h-4" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Image Upload States
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
    costPrice: '',
    stock: '',
    categoryId: '',
    imageUrl: '',
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        api.getProducts(search, selectedCategory),
        api.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      addToast('error', 'Gagal memuat produk', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setCompressionInfo(null);
    setImageInputMode('upload');
    setFormData({
      sku: '',
      name: '',
      price: '',
      costPrice: '',
      stock: '',
      categoryId: categories[0]?.id || '',
      imageUrl: '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setCompressionInfo(null);
    // If imageUrl is data URL or standard URL/path, default mode
    setImageInputMode(product.imageUrl?.startsWith('data:') ? 'upload' : 'upload');
    setFormData({
      sku: product.sku,
      name: product.name,
      price: product.price.toString(),
      costPrice: product.costPrice ? product.costPrice.toString() : '',
      stock: product.stock.toString(),
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || '',
    });
    setIsFormModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('error', 'Format File Salah', 'Mohon pilih file gambar (JPG, PNG, WEBP, dsb).');
      return;
    }

    try {
      setUploadingImage(true);
      const result = await compressImageToWebP(file, 500, 0.75);
      setFormData((prev) => ({ ...prev, imageUrl: result.dataUrl }));
      setCompressionInfo(`Terkompresi dari ${result.originalSizeKb} KB ➔ ${result.compressedSizeKb} KB (WebP)`);
      addToast('success', 'Gambar Berhasil Diolah', `File terkompresi otomatis ke WebP (${result.compressedSizeKb} KB).`);
    } catch (err: any) {
      addToast('error', 'Gagal Memproses Gambar', err.message || 'Terjadi kesalahan saat membaca file');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setCompressionInfo(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock || !formData.categoryId) {
      addToast('error', 'Form Tidak Lengkap', 'Mohon isi semua field wajib.');
      return;
    }

    try {
      const payload = {
        sku: formData.sku,
        name: formData.name,
        price: Number(formData.price),
        costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
        stock: Number(formData.stock),
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl || undefined,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        addToast('success', 'Produk Diperbarui', `Produk "${formData.name}" berhasil diupdate.`);
      } else {
        await api.createProduct(payload);
        addToast('success', 'Produk Ditambahkan', `Produk "${formData.name}" berhasil dibuat.`);
      }

      setIsFormModalOpen(false);
      loadProducts();
    } catch (err: any) {
      addToast('error', 'Gagal Menyimpan Produk', err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await api.deleteProduct(deletingProduct.id);
      addToast('success', 'Produk Dihapus', `Produk "${deletingProduct.name}" telah dihapus.`);
      setIsDeleteModalOpen(false);
      loadProducts();
    } catch (err: any) {
      addToast('error', 'Gagal Menghapus Produk', err.message);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-fade-in">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Tambah Produk
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden border-slate-800">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Foto & Nama</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Harga Beli</th>
                  <th className="p-4">Harga Jual</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden border border-slate-700 shrink-0">
                          <ProductImage src={prod.imageUrl} alt={prod.name} />
                        </div>
                        <span className="font-semibold text-slate-100">{prod.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{prod.sku}</td>
                    <td className="p-4 text-slate-300">{prod.category?.name || 'Uncategorized'}</td>
                    <td className="p-4 text-slate-400">
                      {prod.costPrice ? formatCurrency(prod.costPrice) : '-'}
                    </td>
                    <td className="p-4 font-bold text-emerald-400">{formatCurrency(prod.price)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${
                          prod.stock <= 5
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-200 border-slate-700'
                        }`}
                      >
                        {prod.stock} unit
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingProduct(prod);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Package className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-sm font-semibold">Belum ada produk</p>
            <p className="text-xs text-slate-500">Klik "Tambah Produk" untuk membuat data baru.</p>
          </div>
        )}
      </div>

      {/* ADD / EDIT FORM MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
        subtitle="Isi data produk katalog toko secara lengkap"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Produk *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Keyboard Mekanikal RGB"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">SKU (Opsional)</label>
              <input
                type="text"
                placeholder="Auto jika kosong"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Kategori *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Harga Jual (Rp) *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="250000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Harga Beli/Modal (Rp)</label>
              <input
                type="number"
                min="0"
                placeholder="150000"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Stok Awal *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="50"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* GAMBAR PRODUK WITH FILE UPLOAD & AUTO-WEBP COMPRESSION */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Gambar Produk</label>
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-medium transition-colors ${
                      imageInputMode === 'upload'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Upload className="w-3 h-3" /> Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-medium transition-colors ${
                      imageInputMode === 'url'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" /> URL Teks
                  </button>
                </div>
              </div>

              {imageInputMode === 'upload' ? (
                <div className="space-y-2">
                  {formData.imageUrl ? (
                    <div className="relative group rounded-xl bg-slate-900 border border-slate-700 p-2 flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Gambar Ready (WebP)
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {compressionInfo || 'Gambar terkompresi otomatis'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-colors shrink-0"
                        title="Hapus Gambar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-900/60 hover:bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all group text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                      {uploadingImage ? (
                        <div className="flex items-center gap-2 text-emerald-400 py-1">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs font-semibold">Mengompresi ke WebP...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors mb-1" />
                          <span className="text-xs font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors">
                            Pilih Gambar dari Laptop / HP
                          </span>
                          <span className="text-[10px] text-slate-400">Auto-kompresi WebP (Max ~25 KB)</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="cth: /products/kabel.jpg atau URL https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Format: `/products/namafile.jpg` atau `https://...`
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploadingImage}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 mt-2 flex items-center justify-center gap-2"
          >
            {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Simpan Produk
          </button>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Produk"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-500/20">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs text-rose-200">
              Apakah Anda yakin ingin menghapus produk <strong>"{deletingProduct?.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/20"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
