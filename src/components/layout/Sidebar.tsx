import React from 'react';
import { NavLink } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Warehouse,
  Truck,
  Building2,
  History,
  Store,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeRole, activeName, roleConfig } = useRole();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'POS Kasir', path: '/pos', icon: ShoppingBag, highlight: true },
    { label: 'Produk Etalase', path: '/products', icon: Package },
    { label: 'Kategori', path: '/categories', icon: FolderTree },
    { label: 'Stok Gudang', path: '/inventory', icon: Warehouse },
    { label: 'Order Pasokan Supplier', path: '/supplier-orders', icon: Truck },
    { label: 'Kontak Supplier', path: '/suppliers', icon: Building2 },
    { label: 'Riwayat Transaksi', path: '/orders', icon: History },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7a35ff] to-[#a855f7] flex items-center justify-center shadow-md shadow-[#7a35ff]/25">
              <Store className="w-5 h-5 text-white font-bold" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wide text-slate-900">
                POS ZALDE
              </h1>
              <span className="text-[10px] text-[#7a35ff] font-bold tracking-wider uppercase block">
                Store Dashboard
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#7a35ff] text-white font-semibold shadow-md shadow-[#7a35ff]/20'
                      : 'text-slate-600 hover:text-[#7a35ff] hover:bg-[#f3eeff]'
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                    Kasir
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-[#f0f2f5] border border-slate-200/60 rounded-xl p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${roleConfig.avatarBg}`}>
              {activeRole === 'KASIR' ? 'KT' : activeRole === 'GUDANG' ? 'SG' : 'AZ'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate">{activeName}</p>
              <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7a35ff]" />
                <span>{roleConfig.shortLabel}</span>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

