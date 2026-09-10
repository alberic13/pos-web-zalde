import React from 'react';
import { UserRole } from '../../context/RoleContext';
import { Store, Warehouse, ShieldAlert, Trash2, UserCheck, Lock } from 'lucide-react';

interface ChatDrawerHeaderProps {
  activeRole: UserRole;
  roleShortLabel: string;
  onClose: () => void;
  onClearHistory: () => void;
}

export const ChatDrawerHeader: React.FC<ChatDrawerHeaderProps> = ({
  activeRole,
  roleShortLabel,
  onClose,
  onClearHistory,
}) => {
  return (
    <div className="mac-window-header space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500 border border-green-700 inline-block" />
          </div>
          <h3 className="text-xs font-black uppercase text-black">Chat Toko & Gudang</h3>
        </div>

        <div className="flex items-center gap-1">
          {activeRole === 'ADMIN' && (
            <button
              onClick={onClearHistory}
              className="mac-btn px-2 py-0.5 text-xs text-red-700 font-bold"
              title="Hapus Riwayat Chat (Admin Only)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onClose} className="mac-btn px-2 py-0.5 text-xs font-bold">
            ✕
          </button>
        </div>
      </div>

      <div className="mac-card p-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-black">
          <UserCheck className="w-3.5 h-3.5 text-black" />
          <span>Role Saya:</span>
        </div>

        <div className="relative">
          <button
            disabled
            className="mac-btn px-2.5 py-1 text-xs font-black uppercase flex items-center gap-1 opacity-90 cursor-not-allowed"
            title="Peran dikunci sesuai akun login"
          >
            {activeRole === 'KASIR' && <Store className="w-3.5 h-3.5" />}
            {activeRole === 'GUDANG' && <Warehouse className="w-3.5 h-3.5" />}
            {activeRole === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5" />}
            <span>{roleShortLabel}</span>
            <Lock className="w-3 h-3 text-gray-800 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
