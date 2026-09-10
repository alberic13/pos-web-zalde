import React from 'react';
import { UserRole } from '../../context/RoleContext';
import { Lock, AlertOctagon, User, KeyRound, RefreshCw, ArrowRight } from 'lucide-react';

interface LoginFormCardProps {
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  errorMessage: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onQuickAdminLogin: () => void;
  onQuickRoleLogin: (role: UserRole) => void;
}

export const LoginFormCard: React.FC<LoginFormCardProps> = ({
  username,
  setUsername,
  password,
  setPassword,
  loading,
  errorMessage,
  onSubmit,
  onQuickAdminLogin,
  onQuickRoleLogin,
}) => {
  return (
    <div className="p-5 bg-[#e8e8e8] space-y-4">
      <div className="mac-card p-3 flex items-start gap-3 bg-white">
        <div className="w-10 h-10 rounded-full rainbow-arrow-badge flex items-center justify-center border-2 border-black shrink-0 shadow-sm">
          <Lock className="w-5 h-5 text-white drop-shadow-md" />
        </div>
        <div>
          <h1 className="text-sm font-black uppercase text-black">Otentikasi Pengguna</h1>
          <p className="text-[11px] text-gray-800 font-semibold leading-tight mt-0.5">
            Silakan masukkan kredensial anda
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mac-card p-3 bg-red-100 border-2 border-red-700 flex items-start gap-2 animate-shake">
          <AlertOctagon className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-red-900 uppercase">Otentikasi Gagal</p>
            <p className="text-[11px] text-red-800 font-semibold mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-black uppercase text-black mb-1">Username System 7</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username (contoh: admin)"
              className="mac-input w-full pl-9 pr-3 py-2 text-xs font-extrabold placeholder-gray-500"
              required
            />
            <User className="w-4 h-4 text-black absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-black mb-1">Password</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password (contoh: admin123)"
              className="mac-input w-full pl-9 pr-3 py-2 text-xs font-extrabold placeholder-gray-500"
              required
            />
            <KeyRound className="w-4 h-4 text-black absolute left-2.5 top-2.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mac-btn w-full py-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Memproses Otentikasi...</span>
            </>
          ) : (
            <>
              <span>Login Ke System 7</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-black"></div>
        <span className="flex-shrink mx-2 text-[10px] font-black uppercase text-gray-700">
          ATAU AKSES CEPAT PERAN
        </span>
        <div className="flex-grow border-t border-black"></div>
      </div>

      <div className="w-full mac-card p-2.5 bg-[#e0e0e0] border-2 border-black flex items-center justify-between gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={onQuickAdminLogin}
          disabled={loading}
          className="mac-btn px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer shrink-0"
        >
          LOGIN ADMIN
        </button>
        <button
          type="button"
          onClick={() => onQuickRoleLogin('KASIR')}
          disabled={loading}
          className="mac-btn px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer shrink-0"
        >
          LOGIN KASIR
        </button>
        <button
          type="button"
          onClick={() => onQuickRoleLogin('GUDANG')}
          disabled={loading}
          className="mac-btn px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer shrink-0"
        >
          LOGIN STAFF GUDANG
        </button>
      </div>
    </div>
  );
};
