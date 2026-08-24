import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Category } from '../types';
import { TableSkeleton } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import {
  Truck,
  Search,
  Building2,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  User,
  Mail,
  MessageCircle,
  MapPin,
  Package,
} from 'lucide-react';

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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal States
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    categorySupply: '',
    notes: '',
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch suppliers & categories from Database API
  const loadData = async () => {
    try {
      setLoading(true);
      const [sups, cats] = await Promise.all([api.getSuppliers(), api.getCategories()]);
      setSuppliers(sups);
      setCategories(cats);
    } catch (err: any) {
      addToast('error', 'Gagal memuat data supplier', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateSupplierModal = () => {
    setEditingSupplier(null);
    setSupplierForm({
      companyName: '',
      contactPerson: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      categorySupply: categories[0]?.name || 'Komponen & Aksesoris PC',
      notes: '',
    });
    setIsSupplierModalOpen(true);
  };

  const openEditSupplierModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupplierForm({
      companyName: sup.companyName,
      contactPerson: sup.contactPerson,
      phone: sup.phone,
      whatsapp: sup.whatsapp,
      email: sup.email || '',
      address: sup.address || '',
      categorySupply: sup.categorySupply,
      notes: sup.notes || '',
    });
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.companyName.trim() || !supplierForm.contactPerson.trim()) {
      addToast('error', 'Form Tidak Lengkap', 'Harap isi Nama Perusahaan dan Contact Person.');
      return;
    }

    let waNum = supplierForm.whatsapp.replace(/\D/g, '');
    if (waNum.startsWith('0')) waNum = '62' + waNum.slice(1);
    else if (!waNum.startsWith('62') && waNum.length > 0) waNum = '62' + waNum;

    const finalWa = waNum || '6281234567890';

    const payload = {
      companyName: supplierForm.companyName.trim(),
      contactPerson: supplierForm.contactPerson.trim(),
      phone: supplierForm.phone.trim() || finalWa,
      whatsapp: finalWa,
      email: supplierForm.email.trim() || undefined,
      address: supplierForm.address.trim() || undefined,
      categorySupply: supplierForm.categorySupply.trim() || categories[0]?.name || 'Komponen & Aksesoris PC',
      notes: supplierForm.notes.trim() || undefined,
    };

    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, payload);
        addToast('success', 'Supplier Diperbarui', `Data "${payload.companyName}" berhasil diupdate.`);
      } else {
        await api.createSupplier(payload);
        addToast('success', 'Supplier Ditambahkan', `Supplier baru "${payload.companyName}" berhasil disimpan.`);
      }
      setIsSupplierModalOpen(false);
      loadData();
    } catch (err: any) {
      addToast('error', 'Gagal Menyimpan Supplier', err.message);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!deletingSupplier) return;
    try {
      await api.deleteSupplier(deletingSupplier.id);
      addToast('success', 'Supplier Dihapus', `Supplier "${deletingSupplier.companyName}" telah dihapus.`);
      setIsDeleteModalOpen(false);
      setDeletingSupplier(null);
      loadData();
    } catch (err: any) {
      addToast('error', 'Gagal Menghapus Supplier', err.message);
    }
  };

  const filteredSuppliers = suppliers.filter((sup) => {
    const matchesSearch =
      !search.trim() ||
      sup.companyName.toLowerCase().includes(search.toLowerCase()) ||
      sup.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      sup.categorySupply.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory !== 'all' && sup.categorySupply !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in font-sans text-black">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="mac-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
              Total Supplier Terdaftar
            </span>
            <h3 className="text-xl font-black text-black mt-0.5">{suppliers.length} <span className="text-xs font-bold text-gray-700">Distributor</span></h3>
          </div>
        </div>

        <div className="mac-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider block">
              Kategori Produk (Database)
            </span>
            <h3 className="text-xl font-black text-black mt-0.5">{categories.length} <span className="text-xs font-bold text-gray-700">Kategori</span></h3>
          </div>
        </div>
      </div>

      {/* Main Header & Search Mac OS Window */}
      <div className="mac-window p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama supplier / contact person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mac-input w-full pl-9 pr-4 py-1.5 text-xs font-semibold placeholder-gray-600 shadow-inner"
            />
          </div>

          {/* FILTER CATEGORY FROM DATABASE */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mac-select w-full sm:w-auto text-xs cursor-pointer font-bold"
          >
            <option value="all">Semua Kategori Pasokan</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openCreateSupplierModal}
          className="mac-btn px-3.5 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Tambah Supplier Baru
        </button>
      </div>

      {/* Supplier Grid Cards */}
      {loading ? (
        <div className="mac-window p-6 text-black">
          <TableSkeleton rows={4} />
        </div>
      ) : filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="mac-card p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-black">{sup.companyName}</h4>
                      <span className="mac-badge mac-badge-indigo mt-0.5">
                        {sup.categorySupply}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditSupplierModal(sup)}
                      className="mac-btn px-2 py-1 text-xs"
                      title="Edit Supplier"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingSupplier(sup);
                        setIsDeleteModalOpen(true);
                      }}
                      className="mac-btn px-2 py-1 text-xs text-red-700"
                      title="Hapus Supplier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-black font-bold">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-700 shrink-0" />
                    <span className="font-extrabold text-black">{sup.contactPerson}</span>
                  </div>

                  {sup.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-700 shrink-0" />
                      <a href={`mailto:${sup.email}`} className="text-black underline font-semibold">
                        {sup.email}
                      </a>
                    </div>
                  )}

                  {sup.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <a
                        href={`https://wa.me/${sup.whatsapp.replace(/\D/g, '').startsWith('0') ? '62' + sup.whatsapp.replace(/\D/g, '').slice(1) : sup.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-emerald-800 hover:underline font-black"
                      >
                        {sup.whatsapp}
                      </a>
                    </div>
                  )}

                  {sup.address && (
                    <div className="flex items-start gap-2 pt-0.5 text-[11px] text-gray-800 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-gray-700 shrink-0 mt-0.5" />
                      <span>{sup.address}</span>
                    </div>
                  )}
                </div>

                {sup.notes && (
                  <div className="p-2 bg-gray-100 border border-black text-[10px] font-bold text-black italic">
                    📌 {sup.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mac-window p-12 text-center space-y-2 text-black">
          <Truck className="w-10 h-10 mx-auto text-gray-600" />
          <p className="text-xs font-black uppercase">Tidak ada supplier ditemukan</p>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT SUPPLIER --- */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title={editingSupplier ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
        subtitle={editingSupplier ? `ID: ${editingSupplier.id}` : 'Isi informasi kontak distributor / supplier'}
      >
        <form onSubmit={handleSaveSupplier} className="space-y-3.5 text-xs font-sans text-black">
          <div>
            <label className="text-black font-black block mb-1 uppercase">Nama Perusahaan / Distributor *</label>
            <input
              type="text"
              required
              placeholder="Contoh: PT Fantech Indonesia Distribution"
              value={supplierForm.companyName}
              onChange={(e) => setSupplierForm({ ...supplierForm, companyName: e.target.value })}
              className="mac-input w-full px-3 py-2 text-xs text-black font-extrabold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-black font-black block mb-1 uppercase">Contact Person *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Bpk. Hendra Setyawan"
                value={supplierForm.contactPerson}
                onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                className="mac-input w-full px-3 py-2 text-xs text-black font-extrabold"
              />
            </div>

            <div>
              <label className="text-black font-black block mb-1 uppercase">Kategori Pasokan *</label>
              <select
                required
                value={supplierForm.categorySupply}
                onChange={(e) => setSupplierForm({ ...supplierForm, categorySupply: e.target.value })}
                className="mac-select w-full text-xs font-bold"
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option value="Komponen & Aksesoris PC">Komponen & Aksesoris PC</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="text-black font-black block mb-1 uppercase">Nomor WhatsApp</label>
            <input
              type="tel"
              placeholder="081234567890 atau 6281234567890"
              value={supplierForm.whatsapp}
              onChange={(e) => setSupplierForm({ ...supplierForm, whatsapp: e.target.value })}
              className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-black"
            />
          </div>

          <div>
            <label className="text-black font-black block mb-1 uppercase">Alamat Email (Opsional)</label>
            <input
              type="email"
              placeholder="sales@supplier.co.id"
              value={supplierForm.email}
              onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
              className="mac-input w-full px-3 py-2 text-xs text-black font-bold"
            />
          </div>

          <div>
            <label className="text-black font-black block mb-1 uppercase">Alamat Kantor / Gudang</label>
            <textarea
              rows={2}
              placeholder="Alamat lengkap distributor..."
              value={supplierForm.address}
              onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
              className="mac-input w-full px-3 py-2 text-xs text-black font-semibold"
            />
          </div>

          <div>
            <label className="text-black font-black block mb-1 uppercase">Catatan Khusus / Ketentuan Order</label>
            <input
              type="text"
              placeholder="Contoh: Min order 10 unit, Diskon 5% untuk grosir..."
              value={supplierForm.notes}
              onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
              className="mac-input w-full px-3 py-2 text-xs text-black font-semibold"
            />
          </div>

          <button
            type="submit"
            className="mac-btn w-full py-2.5 text-xs font-black uppercase flex items-center justify-center gap-2"
          >
            <Building2 className="w-4 h-4" /> {editingSupplier ? 'Simpan Perubahan' : 'Tambah Supplier Sekarang'}
          </button>
        </form>
      </Modal>

      {/* --- MODAL: CONFIRM DELETE --- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Supplier"
      >
        {deletingSupplier && (
          <div className="space-y-4 text-xs font-sans text-black">
            <div className="p-3 bg-red-100 border-2 border-black flex items-center gap-3 font-extrabold">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-700" />
              <span>
                Apakah Anda yakin ingin menghapus <strong>"{deletingSupplier.companyName}"</strong> dari kontak supplier?
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="mac-btn flex-1 py-2 text-xs font-black uppercase"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSupplier}
                className="mac-btn flex-1 py-2 text-xs font-black uppercase mac-btn-active text-white bg-red-700"
              >
                Ya, Hapus Supplier
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
