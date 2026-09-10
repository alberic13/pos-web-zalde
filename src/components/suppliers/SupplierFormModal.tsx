import React from 'react';
import { Modal } from '../common/Modal';
import { Category } from '../../types';
import { Supplier } from '../../pages/SuppliersPage';
import { Building2 } from 'lucide-react';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSupplier: Supplier | null;
  form: {
    companyName: string;
    contactPerson: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    categorySupply: string;
    notes: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    companyName: string;
    contactPerson: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    categorySupply: string;
    notes: string;
  }>>;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
}

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  editingSupplier,
  form,
  setForm,
  categories,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSupplier ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
      subtitle={editingSupplier ? `ID: ${editingSupplier.id}` : 'Isi informasi kontak distributor / supplier'}
    >
      <form onSubmit={onSubmit} className="space-y-3.5 text-xs font-sans text-black">
        <div>
          <label className="text-black font-black block mb-1 uppercase">Nama Perusahaan / Distributor *</label>
          <input
            type="text"
            required
            placeholder="Contoh: PT Fantech Indonesia Distribution"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
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
              value={form.contactPerson}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              className="mac-input w-full px-3 py-2 text-xs text-black font-extrabold"
            />
          </div>

          <div>
            <label className="text-black font-black block mb-1 uppercase">Kategori Pasokan *</label>
            <select
              required
              value={form.categorySupply}
              onChange={(e) => setForm({ ...form, categorySupply: e.target.value })}
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
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            className="mac-input w-full px-3 py-2 text-xs font-mono text-black font-black"
          />
        </div>

        <div>
          <label className="text-black font-black block mb-1 uppercase">Alamat Email (Opsional)</label>
          <input
            type="email"
            placeholder="sales@supplier.co.id"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mac-input w-full px-3 py-2 text-xs text-black font-bold"
          />
        </div>

        <div>
          <label className="text-black font-black block mb-1 uppercase">Alamat Kantor / Gudang</label>
          <textarea
            rows={2}
            placeholder="Alamat lengkap distributor..."
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="mac-input w-full px-3 py-2 text-xs text-black font-semibold"
          />
        </div>

        <div>
          <label className="text-black font-black block mb-1 uppercase">Catatan Khusus / Ketentuan Order</label>
          <input
            type="text"
            placeholder="Contoh: Min order 10 unit, Diskon 5% untuk grosir..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
  );
};
