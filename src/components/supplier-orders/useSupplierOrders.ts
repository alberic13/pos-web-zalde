import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Product } from '../../types';
import { Supplier } from '../../pages/SuppliersPage';
import { ToastMessage } from '../common/Toast';
import { useEditCostPrice } from './useEditCostPrice';
import { formatCurrency, cleanWhatsAppNumber } from '../../utils/format';
import { getErrorMessage } from '../../utils/error';

export function useSupplierOrders() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'empty'>('all');
  const [selectedSupplierMap, setSelectedSupplierMap] = useState<Record<string, string>>({});
  const [orderQtyMap, setOrderQtyMap] = useState<Record<string, number>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToasts((prev) => [...prev, { id: Date.now().toString(), type, title, message }]);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const getCostPrice = (prod: Product) => (prod.costPrice && prod.costPrice > 0 ? prod.costPrice : Math.round(prod.price * 0.8));

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, sups] = await Promise.all([api.getProducts(search), api.getSuppliers()]);
      setProducts(prods);
      setSuppliers(sups);

      const initSupplierMap: Record<string, string> = { ...selectedSupplierMap };
      const initQtyMap: Record<string, number> = { ...orderQtyMap };
      prods.forEach((p: Product) => {
        if (!initQtyMap[p.id]) initQtyMap[p.id] = 10;
        if (!initSupplierMap[p.id]) {
          const catName = p.category?.name || '';
          const match = sups.find((s: Supplier) =>
            s.categorySupply.toLowerCase().includes(catName.toLowerCase()) || catName.toLowerCase().includes(s.categorySupply.toLowerCase())
          );
          initSupplierMap[p.id] = match ? match.id : sups[0]?.id || '';
        }
      });
      setSelectedSupplierMap(initSupplierMap);
      setOrderQtyMap(initQtyMap);
    } catch (err: unknown) {
      addToast('error', 'Gagal memuat data stok', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const updateQty = (productId: string, delta: number) => {
    setOrderQtyMap((prev) => ({ ...prev, [productId]: Math.max(1, (prev[productId] || 10) + delta) }));
  };

  const setQtyDirect = (productId: string, val: string) => {
    setOrderQtyMap((prev) => ({ ...prev, [productId]: Math.max(1, parseInt(val) || 1) }));
  };

  const handleSupplierChange = (productId: string, supplierId: string) => {
    setSelectedSupplierMap((prev) => ({ ...prev, [productId]: supplierId }));
  };

  const directWhatsAppOrder = (prod: Product) => {
    const supplierId = selectedSupplierMap[prod.id] || suppliers[0]?.id;
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return addToast('error', 'Pilih Supplier', 'Harap pilih supplier untuk barang ini.');

    const qty = orderQtyMap[prod.id] || 10;
    const costPrice = getCostPrice(prod);
    const totalAmount = costPrice * qty;
    const cleanWa = cleanWhatsAppNumber(supplier.whatsapp);

    const text = `*ORDER STOK BARANG (PURCHASE ORDER)* 📦\n-----------------------------------------\nKepada: *${supplier.companyName}*\nAttn: *${supplier.contactPerson}*\n\nHalo, POS ZALDE STORE ingin order:\n🔹 *Produk:* ${prod.name} (${prod.sku})\n🔹 *Jumlah:* ${qty} Unit\n🔹 *Harga Modal:* ${formatCurrency(costPrice)} / unit\n💰 *Total:* ${formatCurrency(totalAmount)}\n\nMohon konfirmasi ketersediaan stok & rekening. Terima kasih! 🙏`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`, '_blank');
    addToast('success', 'Membuka WhatsApp...', `Order ${qty} unit "${prod.name}" disiapkan.`);
  };

  const editCost = useEditCostPrice({
    onSuccess: (msg) => addToast('success', 'Berhasil', msg),
    onError: (t, m) => addToast('error', t, m),
    onRefresh: loadData,
    getCostPrice,
  });

  const filteredProducts = products.filter((p) => {
    if (filterMode === 'low') return p.warehouseStock <= 5;
    if (filterMode === 'empty') return p.warehouseStock <= 0;
    return true;
  });

  const totalWarehouseStock = products.reduce((sum, p) => sum + p.warehouseStock, 0);
  const lowWarehouseCount = products.filter((p) => p.warehouseStock <= 5).length;
  const totalOrderValue = products.reduce((sum, p) => sum + (orderQtyMap[p.id] || 10) * getCostPrice(p), 0);

  return {
    products,
    suppliers,
    loading,
    search,
    setSearch,
    filterMode,
    setFilterMode,
    selectedSupplierMap,
    orderQtyMap,
    toasts,
    removeToast,
    getCostPrice,
    updateQty,
    setQtyDirect,
    handleSupplierChange,
    directWhatsAppOrder,
    editCost,
    filteredProducts,
    totalWarehouseStock,
    lowWarehouseCount,
    totalOrderValue,
  };
}
