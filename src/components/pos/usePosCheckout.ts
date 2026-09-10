import { useState } from 'react';
import { api } from '../../lib/api';
import { CartItem } from '../../types';
import { formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/error';

interface UsePosCheckoutProps {
  cart: CartItem[];
  total: number;
  clearCart: () => void;
  onSuccess: (order: any) => void;
  onError: (title: string, msg?: string) => void;
  onRefreshProducts: () => void;
}

export function usePosCheckout({
  cart,
  total,
  clearCart,
  onSuccess,
  onError,
  onRefreshProducts,
}: UsePosCheckoutProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');
  const [submitting, setSubmitting] = useState(false);

  const numericPayment = typeof paymentAmount === 'number' ? paymentAmount : 0;
  const change = numericPayment - total;

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (numericPayment < total) {
      onError('Pembayaran Kurang', `Nominal kurang ${formatCurrency(Math.abs(change))}`);
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
      onSuccess(res);
      onRefreshProducts();
    } catch (err: unknown) {
      onError('Gagal Memproses Transaksi', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isCheckoutOpen,
    setIsCheckoutOpen,
    isReceiptOpen,
    setIsReceiptOpen,
    completedOrder,
    paymentAmount,
    setPaymentAmount,
    paymentMethod,
    setPaymentMethod,
    submitting,
    numericPayment,
    change,
    handleProcessCheckout,
  };
}
