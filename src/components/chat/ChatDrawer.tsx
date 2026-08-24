import React, { useState, useEffect, useRef } from 'react';
import { useRole, UserRole, ROLE_CONFIGS } from '../../context/RoleContext';
import {
  MessageSquare,
  Send,
  Store,
  Warehouse,
  ShieldAlert,
  Trash2,
  Zap,
  RefreshCw,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  message: string;
  isQuickMsg: boolean;
  createdAt: string;
}

interface ProductOption {
  id: string;
  name: string;
  stock: number;
  warehouseStock: number;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose }) => {
  const { activeRole, activeName, roleConfig, setActiveRole } = useRole();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch Chat Messages
  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat/messages');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    }
  };

  // Fetch Products for Quick Template insertion (Low Stock Products: stock <= 5 OR warehouseStock <= 5)
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const lowStockList = data.data
          .filter((p: any) => p.stock <= 5 || (p.warehouseStock ?? 0) <= 5)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            stock: p.stock,
            warehouseStock: p.warehouseStock ?? 0,
          }));
        setProducts(lowStockList);
      }
    } catch (err) {
      console.error('Failed to fetch products for chat:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchMessages().finally(() => setLoading(false));
      fetchProducts();
    }
  }, [isOpen]);

  // Polling every 3 seconds when open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Send Message Handler
  const handleSendMessage = async (msgContent?: string, isQuick = false) => {
    const textToSend = (msgContent || inputText).trim();
    if (!textToSend || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRole: activeRole,
          senderName: activeName,
          message: textToSend,
          isQuickMsg: isQuick,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data]);
        if (!msgContent) setInputText('');
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  // Clear Chat History (Admin Only)
  const handleClearHistory = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus seluruh riwayat percakapan?')) return;
    try {
      const res = await fetch('/api/chat/messages', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  // Quick Preset Actions
  const handleQuickTemplate = (templateType: string) => {
    const prodName = selectedProduct
      ? products.find((p) => p.id === selectedProduct)?.name || 'Produk'
      : 'Produk Etalase';

    let msg = '';
    if (templateType === 'RESTOCK_REQ') {
      msg = `📢 [MOHON RESTOK] Tolong pindahkan ${prodName} dari gudang ke etalase toko depan ya 🙏`;
    } else if (templateType === 'CHECK_STOCK') {
      msg = `❓ [CEK STOK GUDANG] Apakah stok ${prodName} masih tersedia di gudang?`;
    } else if (templateType === 'RESTOCK_DONE') {
      msg = `✅ [RESTOK SELESAI] Stok ${prodName} sudah dipindahkan ke etalase toko depan!`;
    } else if (templateType === 'LOW_STOCK_WARN') {
      msg = `⚠️ [WARNING STOK GUDANG] Stok gudang untuk ${prodName} hampir habis! Mohon order supplier.`;
    }

    if (msg) {
      handleSendMessage(msg, true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity font-sans text-black">
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 mac-window rounded-none border-l-2 border-black flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mac OS Window Header */}
        <div className="mac-window-header space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500 border border-green-700 inline-block" />
              </div>
              <h3 className="text-xs font-black uppercase text-black">
                Chat Toko & Gudang (Mac OS)
              </h3>
            </div>

            <div className="flex items-center gap-1">
              {activeRole === 'ADMIN' && (
                <button
                  onClick={handleClearHistory}
                  className="mac-btn px-2 py-0.5 text-xs text-red-700 font-bold"
                  title="Hapus Riwayat Chat (Admin Only)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="mac-btn px-2 py-0.5 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Role Switcher Bar */}
          <div className="mac-card p-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-black">
              <UserCheck className="w-3.5 h-3.5 text-black" />
              <span>Role Saya:</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="mac-btn px-2.5 py-1 text-xs font-black uppercase flex items-center gap-1"
              >
                {activeRole === 'KASIR' && <Store className="w-3.5 h-3.5" />}
                {activeRole === 'GUDANG' && <Warehouse className="w-3.5 h-3.5" />}
                {activeRole === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5" />}
                <span>{roleConfig.shortLabel}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-1 w-52 mac-window p-1 z-50 shadow-2xl">
                  <p className="px-2 py-1 text-[9px] uppercase font-black text-gray-700 border-b border-black">
                    Pilih Peran Pengguna
                  </p>
                  {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((r) => {
                    const cfg = ROLE_CONFIGS[r];
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          setActiveRole(r);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs font-extrabold text-left transition-colors uppercase ${
                          activeRole === r ? 'mac-btn-active' : 'hover:bg-gray-300'
                        }`}
                      >
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 mac-pinstripe-bg">
          {loading ? (
            <div className="flex items-center justify-center h-full text-black font-bold gap-2 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Memuat riwayat chat...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-black text-center p-6 space-y-2">
              <MessageSquare className="w-10 h-10 text-gray-600" />
              <p className="text-xs font-black uppercase">Belum ada percakapan</p>
              <p className="text-[10px] text-gray-700 font-semibold">
                Gunakan template cepat di bawah atau ketik pesan untuk berkomunikasi.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderRole === activeRole;
              const formattedTime = new Date(msg.createdAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} gap-1`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-1.5 text-[9px] text-black font-bold px-1 uppercase">
                    <span className="mac-badge mac-badge-indigo">
                      {msg.senderRole === 'KASIR' ? 'Toko Depan' : msg.senderRole === 'GUDANG' ? 'Gudang' : 'Admin'}
                    </span>
                    <span>{msg.senderName}</span>
                    <span>•</span>
                    <span className="text-gray-700">{formattedTime}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] mac-card p-2.5 text-xs font-semibold leading-snug ${
                      isMine
                        ? 'bg-gradient-to-b from-[#ffffff] to-[#d0d0d0] text-black border-2 border-black'
                        : 'bg-white text-black border-2 border-gray-600'
                    } ${msg.isQuickMsg ? 'border-l-4 border-l-yellow-500' : ''}`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Templates Section */}
        <div className="p-3 border-t-2 border-black bg-gray-300 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-black font-extrabold uppercase">
            <span className="flex items-center gap-1 text-black">
              <Zap className="w-3.5 h-3.5 text-yellow-600" /> Template Cepat
            </span>
            {products.length > 0 && (
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="mac-select text-[10px] max-w-[180px] truncate"
              >
                <option value="">-- Pilih Produk Low Stock --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Etalase:{p.stock} | Gd:{p.warehouseStock})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => handleQuickTemplate('RESTOCK_REQ')}
              className="mac-btn px-2 py-1 text-[10px] font-black uppercase"
            >
              📢 Minta Restok
            </button>
            <button
              onClick={() => handleQuickTemplate('LOW_STOCK_WARN')}
              className="mac-btn px-2 py-1 text-[10px] font-black uppercase text-red-700"
            >
              ⚠️ Stok Gudang Menipis
            </button>
            {activeRole === 'GUDANG' || activeRole === 'ADMIN' ? (
              <button
                onClick={() => handleQuickTemplate('RESTOCK_DONE')}
                className="mac-btn px-2 py-1 text-[10px] font-black uppercase"
              >
                ✅ Restok Selesai
              </button>
            ) : null}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Pesan ${roleConfig.shortLabel}...`}
              className="mac-input flex-1 px-3 py-1.5 text-xs font-semibold placeholder-gray-600"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="mac-btn px-3 py-1.5 text-xs font-black uppercase disabled:opacity-40 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
