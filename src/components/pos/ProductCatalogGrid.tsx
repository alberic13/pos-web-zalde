import React, { useState } from 'react';
import { Product, Category, CartItem } from '../../types';
import { PackageX } from 'lucide-react';

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

interface ProductCatalogGridProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  totalProductsCount: number;
  filteredProducts: Product[];
  cart: CartItem[];
  loading: boolean;
  onAddToCart: (product: Product) => void;
}

export const ProductCatalogGrid: React.FC<ProductCatalogGridProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  totalProductsCount,
  filteredProducts,
  cart,
  loading,
  onAddToCart,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="flex-1 min-w-0 w-full flex flex-col space-y-4">
      {/* Category Dropdown Filter Bar */}
      <div className="mac-window p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <label
            htmlFor="pos-category-select"
            className="text-xs font-extrabold text-black uppercase tracking-wide whitespace-nowrap"
          >
            Kategori:
          </label>
          <select
            id="pos-category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="mac-select text-xs py-1 px-2.5 min-w-[180px] sm:min-w-[220px] font-bold cursor-pointer"
          >
            <option value="all">Semua Kategori ({totalProductsCount})</option>
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
                  onClick={() => onAddToCart(product)}
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
            <h3 className="text-xs font-bold text-black uppercase">
              Tidak ada produk ditemukan
            </h3>
            <p className="text-[11px] text-gray-600 mt-1">
              Coba kata kunci lain atau pilih kategori lain.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
