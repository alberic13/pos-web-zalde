import React from 'react';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/format';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Struk Transaksi POS"
      subtitle="Transaksi Berhasil Disimpan"
    >
      <div className="space-y-4 text-xs font-mono text-black">
        <div className="text-center pb-3 border-b-2 border-dashed border-black space-y-1">
          <h4 className="font-sans text-base font-black text-black">POS ZALDE STORE</h4>
          <p className="text-[11px] text-gray-700">Jl. Teknologi No. 88, Jakarta</p>
          <p className="text-[10px] text-gray-600">No: {order.orderNumber}</p>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between">
              <div>
                <p className="font-sans font-bold text-black">{item.product?.name}</p>
                <p className="text-[10px] text-gray-700">
                  {item.quantity} x {formatCurrency(item.price)}
                </p>
              </div>
              <span className="font-bold text-black">
                {formatCurrency(item.quantity * item.price)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t-2 border-dashed border-black space-y-1 text-black">
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-black">{formatCurrency(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Dibayar ({order.paymentMethod}):</span>
            <span>{formatCurrency(order.paymentAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kembali:</span>
            <span className="font-black">{formatCurrency(order.changeAmount)}</span>
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
            onClick={onClose}
            className="mac-btn flex-1 py-2.5 text-xs font-black uppercase mac-btn-active"
          >
            Selesai
          </button>
        </div>
      </div>
    </Modal>
  );
};
