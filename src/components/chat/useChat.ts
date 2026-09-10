import { useState, useEffect, useRef } from 'react';
import { useRole, UserRole } from '../../context/RoleContext';

export interface ChatMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  message: string;
  isQuickMsg: boolean;
  createdAt: string;
}

export interface ProductOption {
  id: string;
  name: string;
  stock: number;
  warehouseStock: number;
}

export function useChat(isOpen: boolean) {
  const { activeRole, activeName, roleConfig } = useRole();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
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
      if (data.success && Array.isArray(data.data)) setMessages(data.data);
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const low = data.data
          .filter((p: any) => p.stock <= 5 || (p.warehouseStock ?? 0) <= 5)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            stock: p.stock,
            warehouseStock: p.warehouseStock ?? 0,
          }));
        setProducts(low);
      }
    } catch (err) {
      console.error('Failed to fetch products for chat:', err);
    }
  };

  const displayedProducts = products.filter((p) => {
    if (activeRole === 'KASIR') return p.stock <= 5;
    if (activeRole === 'GUDANG') return (p.warehouseStock ?? 0) <= 5;
    return p.stock <= 5 || (p.warehouseStock ?? 0) <= 5;
  });

  useEffect(() => {
    if (selectedProduct && !displayedProducts.some((p) => p.id === selectedProduct)) {
      setSelectedProduct('');
    }
  }, [activeRole, displayedProducts, selectedProduct]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchMessages().finally(() => setLoading(false));
      fetchProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (msgContent?: string, isQuick = false) => {
    const text = (msgContent || inputText).trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderRole: activeRole, senderName: activeName, message: text, isQuickMsg: isQuick }),
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
      if (data.success) setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  const handleQuickTemplate = (templateType: string) => {
    const prodName = selectedProduct ? products.find((p) => p.id === selectedProduct)?.name || 'Produk' : 'Produk Etalase';
    let msg = '';
    if (templateType === 'RESTOCK_REQ') msg = `📢 [MOHON RESTOK] Tolong pindahkan ${prodName} dari gudang ke etalase toko depan ya 🙏`;
    else if (templateType === 'CHECK_STOCK') msg = `❓ [CEK STOK GUDANG] Apakah stok ${prodName} masih tersedia di gudang?`;
    else if (templateType === 'RESTOCK_DONE') msg = `✅ [RESTOK SELESAI] Stok ${prodName} sudah dipindahkan ke etalase toko depan!`;
    else if (templateType === 'LOW_STOCK_WARN') msg = `⚠️ [WARNING STOK GUDANG] Stok gudang untuk ${prodName} hampir habis! Mohon order supplier.`;

    if (msg) handleSendMessage(msg, true);
  };

  return {
    activeRole,
    roleConfig,
    messages,
    inputText,
    setInputText,
    loading,
    sending,
    displayedProducts,
    selectedProduct,
    setSelectedProduct,
    messagesEndRef,
    handleSendMessage,
    handleClearHistory,
    handleQuickTemplate,
  };
}
