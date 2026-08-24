import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, hasAccessToRoute, roleConfig } = useRole();
  const location = useLocation();

  if (!isAuthenticated) {
    // User is not logged in, redirect to Classic Mac System 7 Login Page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check route permissions
  const isAllowed = hasAccessToRoute(location.pathname);

  if (!isAllowed) {
    // Access Denied System 7 Modal Screen
    return (
      <div className="min-h-screen mac-pinstripe-bg flex items-center justify-center p-4 font-sans text-black select-none">
        <div className="w-full max-w-md mac-window p-0 shadow-2xl">
          <div className="mac-window-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700 inline-block" />
              <h2 className="text-xs font-black uppercase text-black">Akses Dibatasi - System 7</h2>
            </div>
            <span className="text-[10px] font-bold text-gray-700">ErrorCode: 403</span>
          </div>

          <div className="p-5 bg-[#e8e8e8] space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-200 border-2 border-red-700 flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-6 h-6 text-red-800" />
            </div>

            <div>
              <h1 className="text-sm font-black uppercase text-black">Akses Halaman Ditolak</h1>
              <p className="text-xs text-gray-800 font-semibold mt-1">
                Peran Anda saat ini (**{roleConfig.label}**) tidak memiliki hak akses ke halaman **{location.pathname}**.
              </p>
            </div>

            <div className="mac-card p-3 bg-yellow-50 border border-black text-left text-xs space-y-1">
              <p className="font-black uppercase text-yellow-900 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-yellow-700" />
                Solusi Akses Penuh:
              </p>
              <p className="text-[11px] text-gray-800 font-medium">
                Silakan login ulang sebagai **ADMIN** untuk mendapatkan akses penuh ke seluruh 8 menu aplikasi.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Link
                to={roleConfig.role === 'GUDANG' ? '/inventory' : roleConfig.role === 'KASIR' ? '/pos' : '/'}
                className="mac-btn flex-1 py-2 text-xs font-black uppercase flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>
                  {roleConfig.role === 'GUDANG' ? 'Ke Stok Gudang' : roleConfig.role === 'KASIR' ? 'Ke POS Terminal' : 'Ke Dashboard'}
                </span>
              </Link>
              <Link
                to="/login"
                className="mac-btn flex-1 py-2 text-xs font-black uppercase bg-purple-200 text-purple-950 flex items-center justify-center gap-1"
              >
                <span>Login Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
