import React, { useState, useEffect, useRef } from 'react';
import { useRole, UserRole, ROLE_CONFIGS } from '../context/RoleContext';
import {
  MessageSquare,
  Send,
  Store,
  Warehouse,
  ShieldAlert,
  Trash2,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { ChatMessage } from '../components/chat/ChatDrawer';

interface ProductOption {
  id: string;
  name: string;
  stock: number;
  warehouseStock: number;
}

export const ChatPage: React.FC = () => {
  const { activeRole, activeName, roleConfig, setActiveRole, setActiveName } = useRole();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    } finally {
      setLoading(false);
    }
  };

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
      console.error('Failed to fetch products:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchProducts();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  return (
    <div className="space-y-6">
      {/* Top Banner / Role Switcher Header */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Pusat Komunikasi Toko & Gudang
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Hubungkan Penjaga Toko Depan & Staff Gudang untuk koordinasi stok dan permintaan restok etalase.
            </p>
          </div>
        </div>

        {/* Role Selector Buttons */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium px-2 hidden sm:inline">Role Aktif:</span>
          {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((r) => {
            const cfg = ROLE_CONFIGS[r];
            const isActive = activeRole === r;
            return (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? `${cfg.badgeBg} ${cfg.badgeText} border ${cfg.badgeBorder} shadow-md`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {r === 'KASIR' && <Store className="w-3.5 h-3.5" />}
                {r === 'GUDANG' && <Warehouse className="w-3.5 h-3.5" />}
                {r === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5" />}
                <span>{cfg.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Sidebar + Chat Box */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Status & Stats Panel */}
        <div className="space-y-4 lg:col-span-1">
          {/* Active User Card */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Identitas Pengirim
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </h3>

            <div className={`p-3 rounded-xl border ${roleConfig.badgeBg} ${roleConfig.badgeBorder} flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold ${roleConfig.avatarBg}`}>
                {activeRole === 'KASIR' ? 'KT' : activeRole === 'GUDANG' ? 'SG' : 'AZ'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-100 truncate">{activeName}</p>
                <span className={`text-[10px] font-semibold uppercase ${roleConfig.badgeText}`}>
                  {roleConfig.label}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[11px] text-slate-400 block mb-1">Ubah Nama Tampilan:</label>
              <input
                type="text"
                value={activeName}
                onChange={(e) => setActiveName(e.target.value)}
                placeholder="Nama Anda..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Chat Container */}
        <div className="lg:col-span-3 glass-card rounded-2xl border border-slate-800 flex flex-col h-[640px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Channel Utama Toko & Gudang</h3>
                <p className="text-[11px] text-slate-400">Pesan otomatis tersinkronisasi antar tab/peramban</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchMessages}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Refresh</span>
              </button>

              {activeRole === 'ADMIN' && (
                <button
                  onClick={handleClearHistory}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bersihkan</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-500 gap-2 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                <span>Memuat percakapan...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center p-8 space-y-2">
                <MessageSquare className="w-12 h-12 text-slate-700" />
                <p className="text-sm font-semibold text-slate-300">Belum ada pesan</p>
                <p className="text-xs text-slate-500 max-w-sm">
                  Silakan kirim pesan atau gunakan tombol template di bawah untuk koordinasi stok etalase & gudang.
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
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} gap-1.5`}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${senderCfg.badgeBg} ${senderCfg.badgeText}`}>
                        {msg.senderRole === 'KASIR' ? 'Toko Depan' : msg.senderRole === 'GUDANG' ? 'Gudang' : 'Admin'}
                      </span>
                      <span className="font-semibold text-slate-200">{msg.senderName}</span>
                      <span>•</span>
                      <span className="text-slate-500">{formattedTime}</span>
                    </div>

                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        isMine
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none shadow-lg shadow-emerald-950/40'
                          : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-none shadow-md'
                      } ${msg.isQuickMsg ? 'border-l-4 border-l-amber-400' : ''}`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions & Input Form */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                <Zap className="w-4 h-4" /> Template Pesan Cepat:
              </div>

              {products.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">Pilih Produk Target:</span>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none max-w-[200px] truncate"
                  >
                    <option value="">-- Pilih Produk Low Stock --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Etalase: {p.stock} | Gudang: {p.warehouseStock})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {activeRole === 'KASIR' || activeRole === 'ADMIN' ? (
                <button
                  onClick={() => handleQuickTemplate('RESTOCK_REQ')}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  📢 Minta Restok Etalase
                </button>
              ) : null}

              {activeRole === 'GUDANG' || activeRole === 'ADMIN' ? (
                <>
                  <button
                    onClick={() => handleQuickTemplate('RESTOCK_DONE')}
                    className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    ✅ Stok Etalase Diisi
                  </button>
                  <button
                    onClick={() => handleQuickTemplate('LOW_STOCK_WARN')}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    ⚠️ Stok Gudang Menipis
                  </button>
                </>
              ) : null}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3 pt-1"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ketik pesan ke tim gudang / toko sebagai ${roleConfig.label}...`}
                className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0 text-xs sm:text-sm"
              >
                <span>Kirim</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
