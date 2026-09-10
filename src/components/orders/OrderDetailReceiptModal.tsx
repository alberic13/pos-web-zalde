import React from 'react';
import { Modal } from '../common/Modal';
import { Order } from '../../types';
import { Printer } from 'lucide-react';

interface OrderDetailReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  formatCurrency: (val: number) => string;
  formatDate: (dateStr: string) => string;
}

export const OrderDetailReceiptModal: React.FC<OrderDetailReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  formatCurrency,
  formatDate,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Struk Transaksi"
      subtitle={`Order #${order?.orderNumber || ''}`}
    >
      {order && (
        <div className="space-y-3.5 text-xs font-mono text-black">
          <div className="text-center pb-2 border-b-2 border-dashed border-black">
            <h4 className="font-sans text-sm font-black text-black uppercase">POS ZALDE STORE</h4>
            <p className="text-[10px] text-gray-700 font-bold">{formatDate(order.createdAt)}</p>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-sans font-extrabold text-black">{item.product?.name || 'Produk'}</p>
                  <p className="text-[10px] text-gray-700 font-bold">
                    {item.quantity} x {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="font-black text-black">{formatCurrency(item.quantity * item.price)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t-2 border-dashed border-black space-y-1 text-black font-bold">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-black text-black">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Metode Bayar:</span>
              <span>{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Jumlah Uang:</span>
              <span>{formatCurrency(order.paymentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kembalian:</span>
              <span className="font-black text-black">{formatCurrency(order.changeAmount)}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => window.print()}
              className="mac-btn w-full py-2 text-xs font-black uppercase flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Cetak Ulang Struk
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
