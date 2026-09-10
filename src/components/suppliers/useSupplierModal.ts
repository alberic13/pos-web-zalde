import { useState } from 'react';
import { api } from '../../lib/api';
import { Supplier } from '../../pages/SuppliersPage';

interface UseSupplierModalProps {
  defaultCategory: string;
  onSuccess: (msg: string) => void;
  onError: (title: string, msg?: string) => void;
  onRefresh: () => void;
}

export function useSupplierModal({ defaultCategory, onSuccess, onError, onRefresh }: UseSupplierModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    categorySupply: '',
    notes: '',
  });

  const openCreate = () => {
    setEditingSupplier(null);
    setForm({
      companyName: '',
      contactPerson: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      categorySupply: defaultCategory || 'Komponen & Aksesoris PC',
      notes: '',
    });
    setIsOpen(true);
  };

  const openEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setForm({
      companyName: sup.companyName,
      contactPerson: sup.contactPerson,
      phone: sup.phone,
      whatsapp: sup.whatsapp,
      email: sup.email || '',
      address: sup.address || '',
      categorySupply: sup.categorySupply,
      notes: sup.notes || '',
    });
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim() || !form.contactPerson.trim()) {
      return onError('Form Tidak Lengkap', 'Harap isi Nama Perusahaan dan Contact Person.');
    }

    let wa = form.whatsapp.replace(/\D/g, '');
    if (wa.startsWith('0')) wa = '62' + wa.slice(1);
    else if (!wa.startsWith('62') && wa.length > 0) wa = '62' + wa;
    const finalWa = wa || '6281234567890';

    const payload = {
      companyName: form.companyName.trim(),
      contactPerson: form.contactPerson.trim(),
      phone: form.phone.trim() || finalWa,
      whatsapp: finalWa,
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      categorySupply: form.categorySupply.trim() || defaultCategory || 'Komponen & Aksesoris PC',
      notes: form.notes.trim() || undefined,
    };

    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, payload);
        onSuccess(`Data "${payload.companyName}" berhasil diupdate.`);
      } else {
        await api.createSupplier(payload);
        onSuccess(`Supplier baru "${payload.companyName}" berhasil disimpan.`);
      }
      close();
      onRefresh();
    } catch (err: any) {
      onError('Gagal Menyimpan Supplier', err.message);
    }
  };

  return {
    isOpen,
    editingSupplier,
    form,
    setForm,
    openCreate,
    openEdit,
    close,
    handleSave,
  };
}
