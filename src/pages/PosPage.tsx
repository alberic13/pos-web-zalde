import React, { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { Product, Category, CartItem } from '../types';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';
import {
  Search,
  ShoppingCart,
  PackageX,
} from 'lucide-react';

const ProductImage: React.FC<{ src?: string | null; alt: string; className?: string }> = ({
  src,
  alt,
  className = 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
}) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
        <PackageX className="w-6 h-6 opacity-60" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

export const PosPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals & Toast State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Debounced search for API calls
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const loadCategories = async () => {
    try {
      const catsData = await api.getCategories();
      setCategories(catsData);
    } catch (err: any) {
      addToast('error', 'Gagal memuat kategori', err.message);
    }
  };

  const loadProducts = async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      const prodsData = await api.getProducts(debouncedSearch, selectedCategory);
      setProducts(prodsData);
    } catch (err: any) {
      addToast('error', 'Gagal memuat data produk', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load categories once on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load products when debouncedSearch or selectedCategory changes
  useEffect(() => {
    const isInitial = products.length === 0;
    loadProducts(isInitial);
  }, [debouncedSearch, selectedCategory]);

  // Keyboard shortcut listener (Esc to clear, F2 or / to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearch('');
        searchInputRef.current?.blur();
      } else if (e.key === 'F2' || (e.key === '/' && document.activeElement !== searchInputRef.current)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-reset category to 'all' when user types in search bar so it searches across all products
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (val.trim() !== '' && selectedCategory !== 'all') {
      setSelectedCategory('all');
    }
  };

  // Instant client-side filtered products (0ms latency search)
  const filteredProducts = products.filter((p) => {
    // 1. Category Tab Filter
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
      return false;
    }

    // 2. Search Terms Filter (multi-word, case-insensitive)
    const searchTerms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (searchTerms.length === 0) return true;

    // Every word typed must match name, sku, or category name
    return searchTerms.every((term) => {
      const nameMatch = p.name.toLowerCase().includes(term);
      const skuMatch = p.sku.toLowerCase().includes(term);
      const categoryMatch = p.category?.name?.toLowerCase().includes(term);
      return nameMatch || skuMatch || categoryMatch;
    });
  });

  // Cart Helpers
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      addToast('error', 'Stok Habis', `Produk "${product.name}" sedang habis.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          addToast('info', 'Batas Stok Reached', `Mencapai sisa stok maksimal (${product.stock} unit).`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              addToast('info', 'Batas Stok', `Mencapai stok maksimal (${item.product.stock} unit).`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Financial Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.11); // PPN 11%
  const total = subtotal + tax;

  const numericPayment = typeof paymentAmount === 'number' ? paymentAmount : 0;
  const change = numericPayment - total;

  // Process Checkout
  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) return;

    if (numericPayment < total) {
      addToast('error', 'Pembayaran Kurang', `Nominal kurang Rp ${Math.abs(change).toLocaleString('id-ID')}`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createOrder({
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        paymentAmount: numericPayment,
        paymentMethod,
      });

      setCompletedOrder(res);
      setIsCheckoutOpen(false);
      setIsReceiptOpen(true);
      clearCart();
      setPaymentAmount('');
      addToast('success', 'Transaksi Berhasil!', `Order ${res.orderNumber} telah dicatat.`);

      // Refresh product stock
      loadProducts(false);
    } catch (err: any) {
      addToast('error', 'Gagal Memproses Transaksi', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="mac-pinstripe-bg p-3 sm:p-5 border-2 border-black shadow-2xl animate-fade-in min-h-[calc(100vh-7rem)] font-sans text-black">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* TOP HEADER BAR - VINTAGE CLASSIC POS KASIR */}
      <div className="mac-window mb-4 p-2 sm:p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo Vintage Rainbow Apple */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full rainbow-arrow-badge flex items-center justify-center border border-black shadow-xs">
            <ShoppingCart className="w-4 h-4 text-white drop-shadow-md" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-black flex items-center gap-1.5">
              Vintage Classic POS Kasir
            </h1>
            <span className="text-[10px] font-bold text-gray-700 block -mt-0.5">
              System
            </span>
          </div>
        </div>

        {/* Search Bar & Go Button */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari Produk... (F2 / Esc)"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="mac-input w-full pl-9 pr-8 py-1.5 text-xs font-semibold placeholder-gray-500 shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => loadProducts(false)}
            className="mac-btn px-4 py-1.5 text-xs uppercase tracking-wider font-extrabold"
          >
            Go
          </button>
        </div>

        {/* User Profile Avatar */}
        <div className="hidden md:flex items-center gap-2 border-l border-gray-400 pl-4">
          <div className="w-7 h-7 rounded-full bg-gray-300 border border-black overflow-hidden flex items-center justify-center text-xs font-bold shadow-2xs">
            👤
          </div>
          <span className="text-xs font-bold text-black">Kasir Toko</span>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* LEFT AREA: Product Catalog & Category Selection (65%) */}
        <div className="flex-1 min-w-0 w-full flex flex-col space-y-4">
          {/* Category Dropdown Filter Bar */}
          <div className="mac-window p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <label htmlFor="pos-category-select" className="text-xs font-extrabold text-black uppercase tracking-wide whitespace-nowrap">
                Kategori:
              </label>
              <select
                id="pos-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mac-select text-xs py-1 px-2.5 min-w-[180px] sm:min-w-[220px] font-bold cursor-pointer"
              >
                <option value="all">Semua Kategori ({products.length})</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[11px] font-bold text-gray-700">
              Total: <span className="text-black font-extrabold">{filteredProducts.length}</span> produk
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-16rem)] pr-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-56 mac-card p-3 animate-pulse space-y-2">
                    <div className="h-28 bg-gray-300 border border-gray-400" />
                    <div className="h-4 w-3/4 bg-gray-300" />
                    <div className="h-3 w-1/2 bg-gray-300" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredProducts.map((product) => {
                  const cartQty = cart.find((i) => i.product.id === product.id)?.quantity || 0;
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      className={`mac-card p-2.5 flex flex-col justify-between text-left relative group ${
                        isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {/* Cart Quantity Badge */}
                      {cartQty > 0 && (
                        <span className="absolute top-1.5 right-1.5 bg-black text-white font-black text-[10px] px-2 py-0.5 border border-white z-10">
                          {cartQty}x
                        </span>
                      )}

                      {/* Image Box */}
                      <div className="w-full h-28 bg-white border-2 border-gray-600 overflow-hidden mb-2 relative flex items-center justify-center">
                        <ProductImage src={product.imageUrl} alt={product.name} />

                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs font-bold text-white uppercase tracking-wider">
                            Stok Habis
                          </div>
                        )}
                      </div>

                      {/* Info & Description */}
                      <div className="flex-1 flex flex-col justify-between space-y-1">
                        <div>
                          <h4 className="text-xs font-extrabold text-black line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-[10px] text-gray-700 line-clamp-2 leading-tight mt-0.5">
                            {product.sku} — {product.category?.name || 'Umum'}
                          </p>
                        </div>

                        {/* Price Tag */}
                        <div className="pt-2 border-t border-gray-400 flex items-center justify-between">
                          <span className="text-xs font-black text-black">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-[9px] font-bold bg-gray-300 px-1 py-0.5 border border-gray-500">
                            Stok: {product.stock}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 mac-window p-6">
                <PackageX className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <h3 className="text-xs font-bold text-black uppercase">Tidak ada produk ditemukan</h3>
                <p className="text-[11px] text-gray-600 mt-1">Coba kata kunci lain atau pilih kategori lain.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT AREA: Ringkasan Pesanan (Mac OS Window) (Fixed 380px on Desktop) */}
        <div className="w-full lg:w-[380px] lg:min-w-[380px] lg:max-w-[380px] shrink-0 mac-window p-0 flex flex-col justify-between sticky top-4">
          {/* Mac OS Window Titlebar Header */}
          <div>
            <div className="mac-window-header flex items-center justify-between">
              {/* Traffic Light Buttons */}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500 border border-green-700 inline-block" />
              </div>

              {/* Title */}
              <h3 className="text-xs font-black text-black uppercase tracking-wider">
                Ringkasan Pesanan
              </h3>

              {/* Order Number Badge */}
              <span className="mac-btn px-2 py-0.5 text-[10px] font-bold">
                Order #{cart.length > 0 ? '042' : '000'}
              </span>
            </div>

            {/* Cart Items List */}
            <div className="p-3 divide-y divide-gray-400 max-h-80 overflow-y-auto">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.product.id} className="py-2.5 flex items-center gap-2 min-w-0">
                    {/* Item Thumbnail */}
                    <div className="w-10 h-10 bg-white border border-black overflow-hidden shrink-0">
                      <ProductImage src={item.product.imageUrl} alt={item.product.name} />
                    </div>

                    {/* Name & Details */}
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-black truncate">{item.product.name}</h5>
                      <p className="text-[11px] font-bold text-gray-800 mt-0.5">
                        {formatCurrency(item.product.price)}
                      </p>
                    </div>

                    {/* 3D Quantity Stepper */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="mac-btn w-6 h-6 flex items-center justify-center text-xs font-black"
                        title="Kurangi"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-extrabold text-black bg-white border border-black py-0.5">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="mac-btn w-6 h-6 flex items-center justify-center text-xs font-black"
                        title="Tambah"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-700 hover:text-black font-bold text-xs p-1 shrink-0"
                      title="Hapus"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-600 space-y-2">
                  <ShoppingCart className="w-8 h-8 mx-auto opacity-50 text-gray-700" />
                  <p className="text-xs font-bold uppercase text-black">Keranjang Kosong</p>
                  <p className="text-[10px] text-gray-600">Pilih produk di sebelah kiri untuk transaksi.</p>
                </div>
              )}
            </div>
          </div>

          {/* Cart Summary & Retro Rainbow Bayar Button */}
          <div className="p-3 border-t-2 border-black bg-gray-300 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold text-gray-800">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800">
                <span>Pajak (11%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-black pt-2 border-t border-black">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Retro Bayar Button with Apple Rainbow Accent */}
            <button
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className={`mac-btn w-full py-3 text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2 transition-all ${
                cart.length > 0
                  ? 'hover:brightness-105 active:scale-98'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <span>Bayar</span>
              <span className="w-6 h-4 rounded-xs rainbow-arrow-badge flex items-center justify-center text-white text-xs font-black shadow-xs">
                ➔
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* CHECKOUT MODAL RETRO MAC OS */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Pembayaran Transaksi Kasir"
        subtitle={`Total Tagihan: ${formatCurrency(total)}`}
      >
        <form onSubmit={handleProcessCheckout} className="space-y-4 font-sans text-black">
          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-extrabold text-black block mb-2 uppercase">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`mac-btn py-2.5 text-xs uppercase ${
                  paymentMethod === 'CASH' ? 'mac-btn-active' : ''
                }`}
              >
                💵 Cash / Tunai
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`mac-btn py-2.5 text-xs uppercase ${
                  paymentMethod === 'QRIS' ? 'mac-btn-active' : ''
                }`}
              >
                💳 QRIS / Digital
              </button>
            </div>
          </div>

          {/* Payment Amount Input */}
          <div>
            <label className="text-xs font-extrabold text-black block mb-1 uppercase">
              Nominal Diterima (Rp)
            </label>
            <input
              type="number"
              required
              min={total}
              placeholder="Masukkan nominal bayar..."
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="mac-input w-full px-3 py-2.5 text-sm font-black text-black placeholder-gray-500"
            />
          </div>

          {/* Quick Money Buttons */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setPaymentAmount(total)}
              className="mac-btn px-2.5 py-1 text-xs"
            >
              Uang Pas ({formatCurrency(total)})
            </button>
            {[20000, 50000, 100000, 200000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setPaymentAmount(amt)}
                className="mac-btn px-2.5 py-1 text-xs"
              >
                Rp {amt / 1000}k
              </button>
            ))}
          </div>

          {/* Kembalian Calculation */}
          <div className="p-3 bg-gray-200 border-2 border-black flex justify-between items-center text-xs font-bold">
            <span>Kembalian:</span>
            <span className={`text-sm font-black ${change >= 0 ? 'text-black' : 'text-red-700'}`}>
              {change >= 0 ? formatCurrency(change) : 'Kurang ' + formatCurrency(Math.abs(change))}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || numericPayment < total}
            className="mac-btn w-full py-3 text-xs font-black uppercase tracking-wider disabled:opacity-40"
          >
            {submitting ? 'Memproses...' : 'Konfirmasi & Selesaikan Transaksi'}
          </button>
        </form>
      </Modal>

      {/* RECEIPT SUCCESS MODAL RETRO MAC OS */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Struk Transaksi POS"
        subtitle="Transaksi Berhasil Disimpan"
      >
        {completedOrder && (
          <div className="space-y-4 text-xs font-mono text-black">
            <div className="text-center pb-3 border-b-2 border-dashed border-black space-y-1">
              <h4 className="font-sans text-base font-black text-black">POS ZALDE STORE</h4>
              <p className="text-[11px] text-gray-700">Jl. Teknologi No. 88, Jakarta</p>
              <p className="text-[10px] text-gray-600">No: {completedOrder.orderNumber}</p>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {completedOrder.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-sans font-bold text-black">{item.product?.name}</p>
                    <p className="text-[10px] text-gray-700">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-black">{formatCurrency(item.quantity * item.price)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t-2 border-dashed border-black space-y-1 text-black">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-black">{formatCurrency(completedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dibayar ({completedOrder.paymentMethod}):</span>
                <span>{formatCurrency(completedOrder.paymentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kembali:</span>
                <span className="font-black">{formatCurrency(completedOrder.changeAmount)}</span>
              </div>
            </div>

            <div className="pt-4 flex gap-2 font-sans">
              <button
                onClick={() => window.print()}
                className="mac-btn flex-1 py-2.5 text-xs font-black uppercase"
              >
                🖨️ Cetak Struk
              </button>
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="mac-btn flex-1 py-2.5 text-xs font-black uppercase mac-btn-active"
              >
                Selesai
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

