import React, { useState, useEffect, useRef } from 'react';
import { useRole, UserRole, ROLE_CONFIGS } from '../../context/RoleContext';
import {
  MessageSquare,
  Send,
  X,
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

  // Fetch Products for Quick Template insertion (Low Stock Products: stock <= 5)
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const lowStockList = data.data
          .filter((p: any) => p.stock <= 5)
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity">
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#f3eeff] text-[#7a35ff] flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Chat Toko & Gudang</h3>
                <p className="text-[10px] text-slate-500">Komunikasi internal real-time</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {activeRole === 'ADMIN' && (
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Hapus Riwayat Chat (Admin Only)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Role Switcher Bar */}
          <div className="bg-[#f0f2f5] border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#7a35ff]" />
              <span className="text-xs text-slate-600 font-medium">Role Aktif Saya:</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder} transition-all`}
              >
                {activeRole === 'KASIR' && <Store className="w-3.5 h-3.5" />}
                {activeRole === 'GUDANG' && <Warehouse className="w-3.5 h-3.5" />}
                {activeRole === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5" />}
                <span>{roleConfig.shortLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                  <p className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
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
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left transition-colors ${
                          activeRole === r ? 'bg-[#f3eeff] text-[#7a35ff] font-bold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {r === 'KASIR' && <Store className="w-3.5 h-3.5 text-[#7a35ff]" />}
                        {r === 'GUDANG' && <Warehouse className="w-3.5 h-3.5 text-amber-600" />}
                        {r === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />}
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
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f0f2f5]/60">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 gap-2 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-[#7a35ff]" />
              <span>Memuat riwayat chat...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-6 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">Belum ada percakapan</p>
              <p className="text-[11px] text-slate-500">
                Gunakan template cepat di bawah atau ketik pesan untuk berkomunikasi.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderRole === activeRole;
              const senderCfg = ROLE_CONFIGS[msg.senderRole] || ROLE_CONFIGS.KASIR;
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
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-1">
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${senderCfg.badgeBg} ${senderCfg.badgeText}`}>
                      {msg.senderRole === 'KASIR' ? 'Toko Depan' : msg.senderRole === 'GUDANG' ? 'Gudang' : 'Admin'}
                    </span>
                    <span className="font-semibold text-slate-700">{msg.senderName}</span>
                    <span>•</span>
                    <span className="text-slate-400">{formattedTime}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      isMine
                        ? 'bg-gradient-to-r from-[#7a35ff] to-[#9333ea] text-white rounded-br-none shadow-sm'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                    } ${msg.isQuickMsg ? 'border-l-4 border-l-amber-500' : ''}`}
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
        <div className="p-3 border-t border-slate-100 bg-white space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-amber-600">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Template Pesan Cepat
            </span>
            {products.length > 0 && (
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded px-2 py-0.5 text-[10px] outline-none max-w-[170px] truncate"
              >
                <option value="">-- Pilih Produk Low Stock --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Etalase: {p.stock} | Gudang: {p.warehouseStock})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {activeRole === 'KASIR' || activeRole === 'ADMIN' ? (
              <button
                onClick={() => handleQuickTemplate('RESTOCK_REQ')}
                className="px-2.5 py-1 bg-[#f3eeff] hover:bg-[#e6d6ff] text-[#7a35ff] border border-[#d1adff] rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all"
              >
                📢 Minta Restok Etalase
              </button>
            ) : null}

            {activeRole === 'GUDANG' || activeRole === 'ADMIN' ? (
              <>
                <button
                  onClick={() => handleQuickTemplate('RESTOCK_DONE')}
                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all"
                >
                  ✅ Stok Etalase Diisi
                </button>
                <button
                  onClick={() => handleQuickTemplate('LOW_STOCK_WARN')}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all"
                >
                  ⚠️ Stok Gudang Menipis
                </button>
              </>
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
              placeholder={`Ketik pesan sebagai ${roleConfig.shortLabel}...`}
              className="flex-1 bg-white border border-slate-300 focus:border-[#7a35ff] focus:ring-2 focus:ring-[#7a35ff]/20 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all shadow-2xs font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="w-9 h-9 bg-[#7a35ff] hover:bg-[#6825e6] disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center shadow-sm transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
