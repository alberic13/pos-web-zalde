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
  Phone,
  Mail,
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
    if (!supplierForm.companyName.trim() || !supplierForm.contactPerson.trim() || !supplierForm.phone.trim()) {
      addToast('error', 'Form Tidak Lengkap', 'Harap isi Nama Perusahaan, Contact Person, dan No Telepon.');
      return;
    }

    let waNum = supplierForm.whatsapp.replace(/\D/g, '');
    if (waNum.startsWith('0')) waNum = '62' + waNum.slice(1);
    else if (!waNum.startsWith('62') && waNum.length > 0) waNum = '62' + waNum;

    const payload = {
      companyName: supplierForm.companyName.trim(),
      contactPerson: supplierForm.contactPerson.trim(),
      phone: supplierForm.phone.trim(),
      whatsapp: waNum || supplierForm.phone.replace(/\D/g, ''),
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
    <div className="space-y-6 animate-fade-in">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-4.5 rounded-2xl border-slate-800 flex items-center gap-4 hover:border-emerald-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Supplier Terdaftar
            </span>
            <h3 className="text-xl font-extrabold text-white mt-0.5">{suppliers.length} <span className="text-xs font-semibold text-slate-400">Distributor</span></h3>
          </div>
        </div>

        <div className="glass-card p-4.5 rounded-2xl border-slate-800 flex items-center gap-4 hover:border-blue-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Kategori Produk (Database)
            </span>
            <h3 className="text-xl font-extrabold text-white mt-0.5">{categories.length} <span className="text-xs font-semibold text-slate-400">Kategori</span></h3>
          </div>
        </div>
      </div>

      {/* Main Header & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama supplier / contact person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* FILTER CATEGORY FROM DATABASE */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
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
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Tambah Supplier Baru
        </button>
      </div>

      {/* Supplier Grid Cards */}
      {loading ? (
        <div className="glass-card p-6 rounded-2xl border-slate-800">
          <TableSkeleton rows={4} />
        </div>
      ) : filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="glass-card p-5 rounded-2xl border-slate-800 space-y-4 hover:border-slate-700/80 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{sup.companyName}</h4>
                      <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400 border border-slate-700">
                        {sup.categorySupply}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditSupplierModal(sup)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Supplier"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingSupplier(sup);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Hapus Supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-semibold text-slate-200">{sup.contactPerson}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-mono text-slate-300">{sup.phone}</span>
                  </div>

                  {sup.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a href={`mailto:${sup.email}`} className="text-slate-400 hover:text-cyan-400 transition-colors underline">
                        {sup.email}
                      </a>
                    </div>
                  )}

                  {sup.address && (
                    <div className="flex items-start gap-2 pt-0.5 text-[11px] text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{sup.address}</span>
                    </div>
                  )}
                </div>

                {sup.notes && (
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 italic">
                    📌 {sup.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 rounded-2xl border-slate-800 text-center space-y-3">
          <Truck className="w-12 h-12 mx-auto text-slate-600" />
          <p className="text-sm font-bold text-slate-300">Tidak ada supplier ditemukan</p>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT SUPPLIER --- */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title={editingSupplier ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
        subtitle={editingSupplier ? `ID: ${editingSupplier.id}` : 'Isi informasi kontak distributor / supplier'}
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Nama Perusahaan / Distributor *</label>
            <input
              type="text"
              required
              placeholder="Contoh: PT Fantech Indonesia Distribution"
              value={supplierForm.companyName}
              onChange={(e) => setSupplierForm({ ...supplierForm, companyName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Nama Contact Person (Sales / PIC) *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Bpk. Hendra Setyawan"
                value={supplierForm.contactPerson}
                onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* DYNAMIC CATEGORY DROPDOWN FROM DATABASE (KATEGORI SIDEBAR) */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Kategori Pasokan (Kategori Sidebar) *</label>
              <select
                required
                value={supplierForm.categorySupply}
                onChange={(e) => setSupplierForm({ ...supplierForm, categorySupply: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Nomor Telepon *</label>
              <input
                type="tel"
                required
                placeholder="081234567890"
                value={supplierForm.phone}
                onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Nomor WhatsApp (Direct Chat)</label>
              <input
                type="tel"
                placeholder="6281234567890"
                value={supplierForm.whatsapp}
                onChange={(e) => setSupplierForm({ ...supplierForm, whatsapp: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Alamat Email (Opsional)</label>
            <input
              type="email"
              placeholder="sales@supplier.co.id"
              value={supplierForm.email}
              onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Alamat Kantor / Gudang Supplier</label>
            <textarea
              rows={2}
              placeholder="Alamat lengkap distributor..."
              value={supplierForm.address}
              onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Catatan Khusus / Ketentuan Order</label>
            <input
              type="text"
              placeholder="Contoh: Min order 10 unit, Diskon 5% untuk grosir..."
              value={supplierForm.notes}
              onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
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
        subtitle="Konfirmasi penghapusan data supplier"
      >
        {deletingSupplier && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-300">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                Apakah Anda yakin ingin menghapus <strong>"{deletingSupplier.companyName}"</strong> dari kontak supplier?
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSupplier}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/20 transition-all"
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
