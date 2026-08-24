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
    <div className="min-h-screen mac-pinstripe-bg text-black flex flex-col md:flex-row relative font-sans">
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
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Floating Action Button for Chat - Retro System 7 3D Button */}
      <button
        onClick={() => setChatDrawerOpen(!chatDrawerOpen)}
        className="fixed bottom-6 right-6 z-40 mac-btn p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group"
        title="Buka Chat Toko & Gudang"
        aria-label="Buka Chat Toko & Gudang"
      >
        <MessageSquare className="w-6 h-6 stroke-[2.5] text-black" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-300 rounded-full border border-black animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 rounded-full border border-black" />
      </button>

      {/* Global Chat Drawer Widget */}
      <ChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
      />
    </div>
  );
};

