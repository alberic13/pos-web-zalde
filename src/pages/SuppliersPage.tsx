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
    <div className="space-y-6 animate-fade-in">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl flex items-center gap-4 hover:border-[#7a35ff]/40 hover:shadow-violet transition-all shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-[#f3eeff] text-[#7a35ff] flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Supplier Terdaftar
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{suppliers.length} <span className="text-xs font-semibold text-slate-500">Distributor</span></h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl flex items-center gap-4 hover:border-blue-500/40 hover:shadow-xs transition-all shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Kategori Produk (Database)
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{categories.length} <span className="text-xs font-semibold text-slate-500">Kategori</span></h3>
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
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-[#7a35ff] focus:ring-2 focus:ring-[#7a35ff]/20 transition-all font-medium"
            />
          </div>

          {/* FILTER CATEGORY FROM DATABASE */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-[#7a35ff] focus:ring-2 focus:ring-[#7a35ff]/20 font-semibold cursor-pointer"
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
          className="px-4 py-2.5 bg-[#7a35ff] hover:bg-[#6825e6] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-[#7a35ff]/25 transition-all shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Tambah Supplier Baru
        </button>
      </div>

      {/* Supplier Grid Cards */}
      {loading ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <TableSkeleton rows={4} />
        </div>
      ) : filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-[#7a35ff]/40 hover:shadow-violet space-y-4 transition-all flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f3eeff] border border-[#d1adff]/40 flex items-center justify-center text-[#7a35ff] shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{sup.companyName}</h4>
                      <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-[#f3eeff] text-[10px] font-bold text-[#7a35ff] border border-[#d1adff]/30">
                        {sup.categorySupply}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditSupplierModal(sup)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Supplier"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingSupplier(sup);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Hapus Supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{sup.contactPerson}</span>
                  </div>

                  {sup.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${sup.email}`} className="text-slate-500 hover:text-[#7a35ff] transition-colors underline">
                        {sup.email}
                      </a>
                    </div>
                  )}

                  {sup.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <a
                        href={`https://wa.me/${sup.whatsapp.replace(/\D/g, '').startsWith('0') ? '62' + sup.whatsapp.replace(/\D/g, '').slice(1) : sup.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-emerald-700 hover:underline font-semibold"
                      >
                        {sup.whatsapp}
                      </a>
                    </div>
                  )}

                  {sup.address && (
                    <div className="flex items-start gap-2 pt-0.5 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{sup.address}</span>
                    </div>
                  )}
                </div>

                {sup.notes && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 italic">
                    📌 {sup.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
          <Truck className="w-12 h-12 mx-auto text-slate-400" />
          <p className="text-sm font-bold text-slate-700">Tidak ada supplier ditemukan</p>
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
            <label className="text-slate-700 font-semibold block mb-1">Nama Perusahaan / Distributor *</label>
            <input
              type="text"
              required
              placeholder="Contoh: PT Fantech Indonesia Distribution"
              value={supplierForm.companyName}
              onChange={(e) => setSupplierForm({ ...supplierForm, companyName: e.target.value })}
              className="w-full bg-[#f0f2f5] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#7a35ff]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Nama Contact Person (Sales / PIC) *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Bpk. Hendra Setyawan"
                value={supplierForm.contactPerson}
                onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                className="w-full bg-[#f0f2f5] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#7a35ff]"
              />
            </div>

            {/* DYNAMIC CATEGORY DROPDOWN FROM DATABASE (KATEGORI SIDEBAR) */}
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Kategori Pasokan (Kategori Sidebar) *</label>
              <select
                required
                value={supplierForm.categorySupply}
                onChange={(e) => setSupplierForm({ ...supplierForm, categorySupply: e.target.value })}
                className="w-full bg-[#f0f2f5] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#7a35ff] font-medium"
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
            <label className="text-slate-700 font-semibold block mb-1">Nomor WhatsApp (Direct Chat / PO)</label>
            <input
              type="tel"
              placeholder="081234567890 atau 6281234567890"
              value={supplierForm.whatsapp}
              onChange={(e) => setSupplierForm({ ...supplierForm, whatsapp: e.target.value })}
              className="w-full bg-[#f0f2f5] border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-[#7a35ff] font-bold focus:outline-none focus:border-[#7a35ff]"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Alamat Email (Opsional)</label>
            <input
              type="email"
              placeholder="sales@supplier.co.id"
              value={supplierForm.email}
              onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
              className="w-full bg-[#f0f2f5] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#7a35ff]"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Alamat Kantor / Gudang Supplier</label>
            <textarea
              rows={2}
              placeholder="Alamat lengkap distributor..."
              value={supplierForm.address}
              onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
              className="w-full bg-[#f0f2f5] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#7a35ff]"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Catatan Khusus / Ketentuan Order</label>
            <input
              type="text"
              placeholder="Contoh: Min order 10 unit, Diskon 5% untuk grosir..."
              value={supplierForm.notes}
              onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
              className="w-full bg-[#f0f2f5] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#7a35ff]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#7a35ff] hover:bg-[#6825e6] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#7a35ff]/25 flex items-center justify-center gap-2"
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
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>
                Apakah Anda yakin ingin menghapus <strong>"{deletingSupplier.companyName}"</strong> dari kontak supplier?
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSupplier}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
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
