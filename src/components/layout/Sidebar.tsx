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
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeRole, activeName, roleConfig, hasAccessToRoute } = useRole();

  const allNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'POS Kasir', path: '/pos', icon: ShoppingBag, highlight: true },
    { label: 'Produk Etalase', path: '/products', icon: Package },
    { label: 'Kategori', path: '/categories', icon: FolderTree },
    { label: 'Stok Gudang', path: '/inventory', icon: Warehouse },
    { label: 'Order Pasokan Supplier', path: '/supplier-orders', icon: Truck },
    { label: 'Kontak Supplier', path: '/suppliers', icon: Building2 },
    { label: 'Riwayat Transaksi', path: '/orders', icon: History },
  ];

  const navItems = allNavItems.filter((item) => hasAccessToRoute(item.path));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 mac-window rounded-none border-r-2 border-black flex flex-col transition-transform duration-300 md:translate-x-0 font-sans text-black ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b-2 border-black bg-gradient-to-b from-[#e0e0e0] to-[#cccccc]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full rainbow-arrow-badge flex items-center justify-center border border-black shadow-xs">
              <Store className="w-4 h-4 text-white drop-shadow-md" />
            </div>
            <div>
              <h1 className="font-black text-sm tracking-tight text-black">
                POS KASIR ZALDE
              </h1>
              <span className="text-[10px] text-gray-800 font-extrabold uppercase block -mt-0.5">
                System
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden mac-btn px-2 py-0.5 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto bg-[#e8e8e8]">
          <p className="px-2 text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5">
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
                  `mac-btn flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold uppercase transition-all ${
                    isActive ? 'mac-btn-active' : ''
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto text-[9px] bg-yellow-300 text-black border border-black font-black px-1.5 py-0.2 uppercase">
                    POS
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-3 border-t-2 border-black bg-gray-300">
          <div className="mac-card p-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white border border-black flex items-center justify-center text-xs font-black shadow-xs">
              {activeRole === 'KASIR' ? 'KT' : activeRole === 'GUDANG' ? 'SG' : 'AZ'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-black truncate">{activeName}</p>
              <p className="text-[10px] text-gray-800 font-bold truncate">
                Role: {roleConfig.shortLabel}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

