import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidth} mac-window p-0 relative overflow-hidden transform transition-all duration-200 animate-scale-up font-sans text-black`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Mac OS Window Header */}
        <div className="mac-window-header flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500 border border-green-700 inline-block" />
          </div>
          <div className="text-center">
            <h3 id="modal-title" className="text-xs font-black uppercase text-black">
              {title}
            </h3>
            {subtitle && <p className="text-[10px] text-gray-700 font-semibold">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="mac-btn px-2 py-0.5 text-xs font-bold"
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-5 bg-[#e8e8e8]">{children}</div>
      </div>
    </div>
  );
};
