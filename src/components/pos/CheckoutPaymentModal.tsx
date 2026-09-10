import React from 'react';
import { Modal } from '../common/Modal';

interface CheckoutPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  paymentMethod: 'CASH' | 'QRIS';
  onPaymentMethodChange: (val: 'CASH' | 'QRIS') => void;
  paymentAmount: number | '';
  onPaymentAmountChange: (val: number | '') => void;
  change: number;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const CheckoutPaymentModal: React.FC<CheckoutPaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  paymentMethod,
  onPaymentMethodChange,
  paymentAmount,
  onPaymentAmountChange,
  change,
  submitting,
  onSubmit,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const numericPayment = typeof paymentAmount === 'number' ? paymentAmount : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pembayaran Transaksi Kasir"
      subtitle={`Total Tagihan: ${formatCurrency(total)}`}
    >
      <form onSubmit={onSubmit} className="space-y-4 font-sans text-black">
        {/* Payment Method Selector */}
        <div>
          <label className="text-xs font-extrabold text-black block mb-2 uppercase">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onPaymentMethodChange('CASH')}
              className={`mac-btn py-2.5 text-xs uppercase ${
                paymentMethod === 'CASH' ? 'mac-btn-active' : ''
              }`}
            >
              💵 Cash / Tunai
            </button>
            <button
              type="button"
              onClick={() => onPaymentMethodChange('QRIS')}
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
            onChange={(e) =>
              onPaymentAmountChange(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="mac-input w-full px-3 py-2.5 text-sm font-black text-black placeholder-gray-500"
          />
        </div>

        {/* Quick Money Buttons */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onPaymentAmountChange(total)}
            className="mac-btn px-2.5 py-1 text-xs"
          >
            Uang Pas ({formatCurrency(total)})
          </button>
          {[20000, 50000, 100000, 200000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => onPaymentAmountChange(amt)}
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
  );
};
