import React from 'react';
import { ToastContainer } from '../components/common/Toast';
import { usePos } from '../components/pos/usePos';
import { PosHeaderBar } from '../components/pos/PosHeaderBar';
import { ProductCatalogGrid } from '../components/pos/ProductCatalogGrid';
import { CartPanel } from '../components/pos/CartPanel';
import { CheckoutPaymentModal } from '../components/pos/CheckoutPaymentModal';
import { ReceiptModal } from '../components/pos/ReceiptModal';

export const PosPage: React.FC = () => {
  const pos = usePos();

  return (
    <div className="mac-pinstripe-bg p-3 sm:p-5 border-2 border-black shadow-2xl animate-fade-in min-h-[calc(100vh-7rem)] font-sans text-black">
      <ToastContainer toasts={pos.toasts} onDismiss={pos.removeToast} />

      {/* TOP HEADER BAR - VINTAGE CLASSIC POS KASIR */}
      <PosHeaderBar
        search={pos.search}
        onSearchChange={pos.handleSearchChange}
        onClearSearch={() => {
          pos.setSearch('');
          pos.searchInputRef.current?.focus();
        }}
        onSearchSubmit={() => pos.loadProducts(false)}
        searchInputRef={pos.searchInputRef}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* LEFT: Product Catalog & Category Selection (65%) */}
        <ProductCatalogGrid
          categories={pos.categories}
          selectedCategory={pos.selectedCategory}
          onCategoryChange={pos.setSelectedCategory}
          totalProductsCount={pos.products.length}
          filteredProducts={pos.filteredProducts}
          cart={pos.cart}
          loading={pos.loading}
          onAddToCart={pos.addToCart}
        />

        {/* RIGHT: Ringkasan Pesanan (Mac OS Window) (Fixed 380px) */}
        <CartPanel
          cart={pos.cart}
          onUpdateQuantity={pos.updateQuantity}
          onRemoveFromCart={pos.removeFromCart}
          subtotal={pos.subtotal}
          tax={pos.tax}
          total={pos.total}
          onOpenCheckout={() => pos.setIsCheckoutOpen(true)}
        />
      </div>

      {/* CHECKOUT MODAL RETRO MAC OS */}
      <CheckoutPaymentModal
        isOpen={pos.isCheckoutOpen}
        onClose={() => pos.setIsCheckoutOpen(false)}
        total={pos.total}
        paymentMethod={pos.paymentMethod}
        onPaymentMethodChange={pos.setPaymentMethod}
        paymentAmount={pos.paymentAmount}
        onPaymentAmountChange={pos.setPaymentAmount}
        change={pos.change}
        submitting={pos.submitting}
        onSubmit={pos.handleProcessCheckout}
      />

      {/* RECEIPT SUCCESS MODAL RETRO MAC OS */}
      <ReceiptModal
        isOpen={pos.isReceiptOpen}
        onClose={() => pos.setIsReceiptOpen(false)}
        order={pos.completedOrder}
      />
    </div>
  );
};

export default PosPage;
