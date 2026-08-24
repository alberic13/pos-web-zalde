import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className="pointer-events-auto mac-window p-3 shadow-2xl transition-all duration-300 animate-slide-up font-sans text-black"
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        <span className="text-base">{toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : 'ℹ️'}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black uppercase text-black">{toast.title}</h4>
          {toast.message && <p className="text-[11px] text-gray-800 font-medium mt-0.5 leading-tight">{toast.message}</p>}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="mac-btn px-1.5 py-0.5 text-[10px] font-bold"
          aria-label="Tutup notifikasi"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
