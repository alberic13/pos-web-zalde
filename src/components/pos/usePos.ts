import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../lib/api';
import { Product, Category } from '../../types';
import { ToastMessage } from '../common/Toast';
import { useCart } from './useCart';
import { usePosCheckout } from './usePosCheckout';

export function usePos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToasts((prev) => [...prev, { id: Date.now().toString(), type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const cart = useCart({
    onInfo: (title, msg) => addToast('info', title, msg),
    onError: (title, msg) => addToast('error', title, msg),
  });

  const loadProducts = useCallback(async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      const prodsData = await api.getProducts(search, selectedCategory);
      setProducts(prodsData);
    } catch (err: any) {
      addToast('error', 'Gagal memuat data produk', err.message);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  const checkout = usePosCheckout({
    cart: cart.cart,
    total: cart.total,
    clearCart: cart.clearCart,
    onSuccess: (res) => addToast('success', 'Transaksi Berhasil!', `Order ${res.orderNumber} telah dicatat.`),
    onError: (title, msg) => addToast('error', title, msg),
    onRefreshProducts: () => loadProducts(false),
  });

  useEffect(() => {
    api.getCategories().then(setCategories).catch((err: any) => addToast('error', 'Gagal memuat kategori', err.message));
  }, []);

  useEffect(() => {
    loadProducts(products.length === 0);
  }, [loadProducts, products.length]);

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

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (val.trim() !== '' && selectedCategory !== 'all') setSelectedCategory('all');
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return true;
    return terms.every((t) => p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t) || p.category?.name?.toLowerCase().includes(t));
  });

  return {
    products,
    categories,
    cart: cart.cart,
    search,
    setSearch,
    handleSearchChange,
    selectedCategory,
    setSelectedCategory,
    loading,
    searchInputRef,
    filteredProducts,
    addToCart: cart.addToCart,
    updateQuantity: cart.updateQuantity,
    removeFromCart: cart.removeFromCart,
    clearCart: cart.clearCart,
    subtotal: cart.subtotal,
    tax: cart.tax,
    total: cart.total,
    ...checkout,
    toasts,
    removeToast,
    loadProducts,
  };
}
