import React from 'react';
import { Menu, Clock, Calendar, Store, Warehouse, ShieldAlert } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onToggleChatDrawer?: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar, title }) => {
  const { activeRole, roleConfig } = useRole();
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="mac-window rounded-none border-x-0 border-t-0 border-b-2 border-black sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between font-sans text-black">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden mac-btn px-2.5 py-1 text-xs"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-4 h-4" />
        </button>
        <h2 className="text-base font-black text-black uppercase tracking-wide">{title}</h2>
      </div>

      <div className="flex items-center gap-2.5">
        {/* User Role Badge */}
        <div className="flex items-center gap-1.5 mac-badge mac-badge-indigo">
          {activeRole === 'KASIR' && <Store className="w-3.5 h-3.5" />}
          {activeRole === 'GUDANG' && <Warehouse className="w-3.5 h-3.5" />}
          {activeRole === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5" />}
          <span>Role: {roleConfig.shortLabel}</span>
        </div>

        {/* Date & Time Widget */}
        <div className="hidden sm:flex items-center gap-2.5 text-xs text-black mac-card px-3 py-1 font-bold">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-800" />
            <span>{formattedDate}</span>
          </div>
          <span className="text-gray-400">|</span>
          <div className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-gray-800" />
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

