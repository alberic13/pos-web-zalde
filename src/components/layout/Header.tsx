import React from 'react';
import { Menu, Clock, Calendar } from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar, title }) => {
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
    <header className="h-16 bg-slate-900/80 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Date & Time Widget */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 glass-card px-3.5 py-1.5 rounded-xl">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div className="flex items-center gap-1.5 font-mono text-slate-200">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
