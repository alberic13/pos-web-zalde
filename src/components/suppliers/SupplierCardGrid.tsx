import React from 'react';
import { Supplier } from '../../pages/SuppliersPage';
import { TableSkeleton } from '../common/Skeleton';
import { Building2, Edit3, Trash2, User, Mail, MessageCircle, MapPin, Truck } from 'lucide-react';
import { cleanWhatsAppNumber } from '../../utils/format';

interface SupplierCardGridProps {
  loading: boolean;
  suppliers: Supplier[];
  onEdit: (sup: Supplier) => void;
  onDelete: (sup: Supplier) => void;
}

export const SupplierCardGrid: React.FC<SupplierCardGridProps> = ({
  loading,
  suppliers,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="mac-window p-6 text-black">
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="mac-window p-12 text-center space-y-2 text-black">
        <Truck className="w-10 h-10 mx-auto text-gray-600" />
        <p className="text-xs font-black uppercase">Tidak ada supplier ditemukan</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {suppliers.map((sup) => {
        const cleanWa = cleanWhatsAppNumber(sup.whatsapp);
        return (
          <div key={sup.id} className="mac-card p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white border border-black flex items-center justify-center text-black font-bold shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-black">{sup.companyName}</h4>
                    <span className="mac-badge mac-badge-indigo mt-0.5">{sup.categorySupply}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => onEdit(sup)} className="mac-btn px-2 py-1 text-xs" title="Edit Supplier">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(sup)} className="mac-btn px-2 py-1 text-xs text-red-700" title="Hapus Supplier">
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
                      href={`https://wa.me/${cleanWa}`}
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
        );
      })}
    </div>
  );
};
