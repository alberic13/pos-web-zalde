import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole, UserRole } from '../context/RoleContext';
import { api } from '../lib/api';
import {
  KeyRound,
  User,
  AlertOctagon,
  ArrowRight,
  RefreshCw,
  Lock,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginSuccess } = useRole();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customRole?: UserRole) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const redirectByRole = (role: string) => {
        if (role === 'GUDANG') return '/inventory';
        if (role === 'KASIR') return '/pos';
        return '/';
      };

      if (customRole) {
        // Quick Role Login
        const res = await api.login({ role: customRole });
        if (res && res.user) {
          loginSuccess(res.user.role as UserRole, res.user.name, res.token);
          navigate(redirectByRole(res.user.role));
          return;
        }
      }

      // Manual Credentials Login
      const res = await api.login({ username, password });
      if (res && res.user) {
        loginSuccess(res.user.role as UserRole, res.user.name, res.token);
        navigate(redirectByRole(res.user.role));
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Login gagal. Pastikan username & password benar (admin / admin123).'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = () => {
    handleLogin(undefined, 'ADMIN');
  };

  return (
    <div className="min-h-screen mac-pinstripe-bg flex items-center justify-center p-4 font-sans text-black relative overflow-hidden select-none">
      {/* System 7 Top Menu Bar */}
      <div className="fixed top-0 left-0 right-0 h-7 bg-gradient-to-b from-[#ffffff] to-[#d6d6d6] border-b-2 border-black flex items-center justify-between px-4 text-xs font-black z-40">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full rainbow-arrow-badge inline-block border border-black" />
            <span className="font-black uppercase tracking-tight">System 7.0</span>
          </span>
          <span className="hidden sm:inline-block hover:bg-black hover:text-white px-2 py-0.5 cursor-pointer">
            File
          </span>
          <span className="hidden sm:inline-block hover:bg-black hover:text-white px-2 py-0.5 cursor-pointer">
            Edit
          </span>
          <span className="hidden sm:inline-block hover:bg-black hover:text-white px-2 py-0.5 cursor-pointer">
            View
          </span>
          <span className="hidden sm:inline-block hover:bg-black hover:text-white px-2 py-0.5 cursor-pointer">
            Special
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-extrabold">
          <span className="hidden md:inline">POS Zalde Terminal v1.0</span>
          <span className="mac-badge mac-badge-emerald">Status: Ready</span>
        </div>
      </div>

      {/* Main Mac OS System 7 Login Dialog Window */}
      <div className="w-full max-w-md mac-window p-0 z-10 shadow-2xl mt-6">
        {/* System 7 Header Controls */}
        <div className="mac-window-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500 border border-green-700 inline-block" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-wide text-black">
              Welcome to POS Zalde
            </h2>
          </div>
          <span className="text-[10px] font-extrabold text-gray-700 uppercase">System 7.5.3</span>
        </div>

        {/* Window Content */}
        <div className="p-5 bg-[#e8e8e8] space-y-4">
          {/* Welcome Banner Box */}
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

          {/* Error Message Modal Box */}
          {errorMessage && (
            <div className="mac-card p-3 bg-red-100 border-2 border-red-700 flex items-start gap-2 animate-shake">
              <AlertOctagon className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-red-900 uppercase">Otentikasi Gagal</p>
                <p className="text-[11px] text-red-800 font-semibold mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Username System 7
              </label>
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
              <label className="block text-xs font-black uppercase text-black mb-1">
                Password
              </label>
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

          {/* Outer Box Container - System 7 Card with Quick Login Buttons */}
          <div className="w-full mac-card p-2.5 bg-[#e0e0e0] border-2 border-black flex items-center justify-between gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              disabled={loading}
              className="mac-btn px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer shrink-0"
            >
              LOGIN ADMIN
            </button>
            <button
              type="button"
              onClick={() => handleLogin(undefined, 'KASIR')}
              disabled={loading}
              className="mac-btn px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer shrink-0"
            >
              LOGIN KASIR
            </button>
            <button
              type="button"
              onClick={() => handleLogin(undefined, 'GUDANG')}
              disabled={loading}
              className="mac-btn px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer shrink-0"
            >
              LOGIN STAFF GUDANG
            </button>
          </div>
        </div>

        {/* Footer Window */}
        <div className="p-2.5 border-t-2 border-black bg-gray-300 flex items-center justify-between text-[10px] font-black text-gray-800 uppercase">
          <span>© 1991-2026 Zalde POS</span>
          <span>System 7.0</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
