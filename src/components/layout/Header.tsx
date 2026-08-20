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
    <header className="h-16 bg-white/90 border-b border-slate-200/80 sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* User Role Badge */}
        <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
          {activeRole === 'KASIR' && <Store className="w-3.5 h-3.5" />}
          {activeRole === 'GUDANG' && <Warehouse className="w-3.5 h-3.5" />}
          {activeRole === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5" />}
          <span>{roleConfig.shortLabel}</span>
        </div>

        {/* Date & Time Widget */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-600 bg-white border border-slate-200/80 shadow-xs px-3.5 py-1.5 rounded-xl">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#7a35ff]" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800">
            <Clock className="w-3.5 h-3.5 text-[#7a35ff]" />
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

