import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatDrawer } from '../chat/ChatDrawer';
import { MessageSquare } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-900 flex flex-col md:flex-row relative">
      <Sidebar
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <Header
          title={title}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onToggleChatDrawer={() => setChatDrawerOpen(!chatDrawerOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Floating Action Button for Chat - Signal Violet */}
      <button
        onClick={() => setChatDrawerOpen(!chatDrawerOpen)}
        className="fixed bottom-6 right-6 z-40 w-13 h-13 bg-gradient-to-tr from-[#7a35ff] to-[#a855f7] hover:from-[#6825e6] hover:to-[#9333ea] text-white p-3.5 rounded-full shadow-lg shadow-[#7a35ff]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
        title="Buka Chat Toko & Gudang"
        aria-label="Buka Chat Toko & Gudang"
      >
        <MessageSquare className="w-6 h-6 stroke-[2.5]" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-300 rounded-full border-2 border-white animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white" />
      </button>

      {/* Global Chat Drawer Widget */}
      <ChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
      />
    </div>
  );
};

