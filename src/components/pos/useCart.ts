import { useState } from 'react';
import { Product, CartItem } from '../../types';

interface UseCartProps {
  onInfo: (title: string, message: string) => void;
  onError: (title: string, message: string) => void;
}

export function useCart({ onInfo, onError }: UseCartProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      onError('Stok Habis', `Produk "${product.name}" sedang habis.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          onInfo(
            'Batas Stok Reached',
            `Mencapai sisa stok maksimal (${product.stock} unit).`
          );
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              onInfo(
                'Batas Stok',
                `Mencapai stok maksimal (${item.product.stock} unit).`
              );
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  return {
    cart,
    setCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    total,
  };
}
