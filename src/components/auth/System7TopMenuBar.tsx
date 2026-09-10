import React from 'react';

export const System7TopMenuBar: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-7 bg-gradient-to-b from-[#ffffff] to-[#d6d6d6] border-b-2 border-black flex items-center justify-between px-4 text-xs font-black z-40">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full rainbow-arrow-badge inline-block border border-black" />
          <span className="font-black uppercase tracking-tight">System 7.0</span>
        </span>
        <span className="hidden sm:inline-block hover:bg-black hover:text-white px-2 py-0.5 cursor-pointer">File</span>
        <span className="hidden sm:inline-block hover:bg-black hover:text-white px-2 py-0.5 cursor-pointer">Edit</span>
        <span className="hidden sm:inline-block hover:bg-black hover:text-white px-2 py-0.5 cursor-pointer">View</span>
        <span className="hidden sm:inline-block hover:bg-black hover:text-white px-2 py-0.5 cursor-pointer">Special</span>
      </div>
      <div className="flex items-center gap-2 text-[11px] font-extrabold">
        <span className="hidden md:inline">POS Zalde Terminal v1.0</span>
        <span className="mac-badge mac-badge-emerald">Status: Ready</span>
      </div>
    </div>
  );
};
