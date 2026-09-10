import React, { useState } from 'react';
import { CartItem } from '../../types';
import { ShoppingCart, PackageX } from 'lucide-react';

const CartItemImage: React.FC<{ src?: string | null; alt: string }> = ({ src, alt }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
        <PackageX className="w-4 h-4 opacity-60" />
      </div>
    );
  }
  return <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setError(true)} />;
};

interface CartPanelProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  onOpenCheckout: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveFromCart,
  subtotal,
  tax,
  total,
  onOpenCheckout,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
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

          <h3 className="text-xs font-black text-black uppercase tracking-wider">
            Ringkasan Pesanan
          </h3>

          <span className="mac-btn px-2 py-0.5 text-[10px] font-bold">
            Order #{cart.length > 0 ? '042' : '000'}
          </span>
        </div>

        {/* Cart Items List */}
        <div className="p-3 divide-y divide-gray-400 max-h-80 overflow-y-auto">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.product.id} className="py-2.5 flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 bg-white border border-black overflow-hidden shrink-0">
                  <CartItemImage src={item.product.imageUrl} alt={item.product.name} />
                </div>

                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-black truncate">{item.product.name}</h5>
                  <p className="text-[11px] font-bold text-gray-800 mt-0.5">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>

                {/* 3D Quantity Stepper */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                    className="mac-btn w-6 h-6 flex items-center justify-center text-xs font-black"
                    title="Kurangi"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-extrabold text-black bg-white border border-black py-0.5">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                    className="mac-btn w-6 h-6 flex items-center justify-center text-xs font-black"
                    title="Tambah"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => onRemoveFromCart(item.product.id)}
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

        <button
          disabled={cart.length === 0}
          onClick={onOpenCheckout}
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
  );
};
