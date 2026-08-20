import React, { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { Product, Category, CartItem } from '../types';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Printer,
  CreditCard,
  Banknote,
  PackageX,
  X,
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
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in min-h-[calc(100vh-7rem)]">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* LEFT AREA: Product Catalog (70%) */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Search & Category Filter Bar */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari produk, SKU, atau kategori... (F2 / Esc)"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-[#7a35ff] focus:ring-2 focus:ring-[#7a35ff]/20 transition-all font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 transition-colors"
                title="Hapus pencarian (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#7a35ff] text-white shadow-md shadow-[#7a35ff]/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-[#f3eeff] hover:text-[#7a35ff]'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#7a35ff] text-white shadow-md shadow-[#7a35ff]/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-[#f3eeff] hover:text-[#7a35ff]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-44 bg-white border border-slate-200 rounded-2xl animate-pulse p-4 space-y-3">
                  <div className="h-20 bg-slate-100 rounded-xl" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const cartQty = cart.find((i) => i.product.id === product.id)?.quantity || 0;
                const isOutOfStock = product.stock <= 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={`bg-white rounded-2xl p-3 flex flex-col justify-between text-left relative overflow-hidden group border transition-all ${
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed border-rose-200 bg-slate-50'
                        : cartQty > 0
                        ? 'border-[#7a35ff] bg-[#f3eeff]/40 shadow-xs'
                        : 'border-slate-200 hover:border-[#7a35ff]/50 hover:shadow-violet'
                    }`}
                  >
                    {/* Badge Quantity in Cart */}
                    {cartQty > 0 && (
                      <span className="absolute top-2 right-2 bg-[#7a35ff] text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-md z-10">
                        {cartQty}x
                      </span>
                    )}

                    {/* Image */}
                    <div className="w-full h-24 rounded-xl bg-slate-100 overflow-hidden mb-2.5 relative">
                      <ProductImage src={product.imageUrl} alt={product.name} />

                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-xs font-bold text-white">
                          Stok Habis
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <span className="text-[10px] font-bold text-[#7a35ff] block uppercase">
                        {product.category?.name || 'Umum'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#7a35ff] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">{product.sku}</p>
                    </div>

                    {/* Footer Price & Stock */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-[#7a35ff]">
                        {formatCurrency(product.price)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          product.stock <= 5 ? 'text-amber-800 bg-amber-100' : 'text-slate-500 bg-slate-100'
                        }`}
                      >
                        Stok: {product.stock}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <PackageX className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">Tidak ada produk ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1">Coba kata kunci lain atau pilih kategori lain.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT AREA: Cart Checkout Panel (30%) */}
      <div className="w-full lg:w-96 bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
        {/* Cart Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#7a35ff]" />
              <h3 className="text-base font-bold text-slate-900">Keranjang Kasir</h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Kosongkan
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto py-2 pr-1 my-2">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.product.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h5>
                    <p className="text-[11px] text-[#7a35ff] font-semibold mt-0.5">
                      {formatCurrency(item.product.price)}{' '}
                      <span className="text-slate-500 font-normal">x {item.quantity}</span>
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-[#f0f2f5] border border-slate-200 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center text-xs transition-colors shadow-2xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center text-xs transition-colors shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <ShoppingCart className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs text-slate-600">Keranjang masih kosong.</p>
                <p className="text-[11px] text-slate-400">Klik item di katalog untuk menambahkan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Calculation & Checkout Button */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-900 font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>PPN (11%)</span>
              <span className="text-slate-900 font-semibold">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Akhir</span>
              <span className="text-[#7a35ff]">{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              cart.length > 0
                ? 'bg-[#7a35ff] hover:bg-[#6825e6] text-white shadow-md shadow-[#7a35ff]/25'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Banknote className="w-4 h-4" />
            Bayar Pesanan
          </button>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Pembayaran Transaksi"
        subtitle={`Total Tagihan: ${formatCurrency(total)}`}
      >
        <form onSubmit={handleProcessCheckout} className="space-y-4">
          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <Banknote className="w-4 h-4" /> Cash / Tunai
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === 'QRIS'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4" /> QRIS / Digital
              </button>
            </div>
          </div>

          {/* Payment Amount Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Nominal Yang Diterima (Rp)
            </label>
            <input
              type="number"
              required
              min={total}
              placeholder="Masukkan nominal bayar..."
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quick Money Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPaymentAmount(total)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 rounded-lg transition-colors border border-slate-200"
            >
              Uang Pas ({formatCurrency(total)})
            </button>
            {[20000, 50000, 100000, 200000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setPaymentAmount(amt)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 rounded-lg transition-colors border border-slate-200"
              >
                Rp {amt / 1000}k
              </button>
            ))}
          </div>

          {/* Kembalian Calculation */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-600 font-semibold">Kembalian:</span>
            <span className={`font-mono font-extrabold text-sm ${change >= 0 ? 'text-[#7a35ff]' : 'text-rose-600'}`}>
              {change >= 0 ? formatCurrency(change) : 'Kurang ' + formatCurrency(Math.abs(change))}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || numericPayment < total}
            className="w-full py-3.5 bg-[#7a35ff] hover:bg-[#6825e6] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#7a35ff]/25 disabled:opacity-50"
          >
            {submitting ? 'Memproses...' : 'Konfirmasi & Selesaikan Transaksi'}
          </button>
        </form>
      </Modal>

      {/* RECEIPT SUCCESS MODAL */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Struk Transaksi POS"
        subtitle="Transaksi Berhasil Disimpan"
      >
        {completedOrder && (
          <div className="space-y-4 text-xs font-mono text-slate-700">
            <div className="text-center pb-3 border-b border-dashed border-slate-200 space-y-1">
              <h4 className="font-sans text-base font-extrabold text-slate-900">POS ZALDE STORE</h4>
              <p className="text-[11px] text-slate-500">Jl. Teknologi No. 88, Jakarta</p>
              <p className="text-[10px] text-slate-400">No: {completedOrder.orderNumber}</p>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {completedOrder.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-sans font-semibold text-slate-900">{item.product?.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(item.quantity * item.price)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-dashed border-slate-200 space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold text-[#7a35ff]">{formatCurrency(completedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dibayar ({completedOrder.paymentMethod}):</span>
                <span>{formatCurrency(completedOrder.paymentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kembali:</span>
                <span className="font-bold text-slate-900">{formatCurrency(completedOrder.changeAmount)}</span>
              </div>
            </div>

            <div className="pt-4 flex gap-2 font-sans">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200"
              >
                <Printer className="w-4 h-4" /> Cetak Struk
              </button>
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="flex-1 py-2.5 bg-[#7a35ff] hover:bg-[#6825e6] text-white text-xs font-extrabold rounded-xl shadow-md shadow-[#7a35ff]/25 transition-all"
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
