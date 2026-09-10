import React from 'react';
import { UserRole } from '../../context/RoleContext';
import { ProductOption } from './useChat';
import { Send } from 'lucide-react';

interface ChatQuickTemplatesProps {
  activeRole: UserRole;
  roleShortLabel: string;
  displayedProducts: ProductOption[];
  selectedProduct: string;
  setSelectedProduct: (val: string) => void;
  inputText: string;
  setInputText: (val: string) => void;
  sending: boolean;
  onQuickTemplate: (type: string) => void;
  onSend: () => void;
}

export const ChatQuickTemplates: React.FC<ChatQuickTemplatesProps> = ({
  activeRole,
  roleShortLabel,
  displayedProducts,
  selectedProduct,
  setSelectedProduct,
  inputText,
  setInputText,
  sending,
  onQuickTemplate,
  onSend,
}) => {
  return (
    <div className="p-3 border-t-2 border-black bg-gray-300 space-y-2">
      <div className="flex items-center justify-between text-[10px] text-black font-extrabold uppercase">
        <span className="text-black">Template Cepat</span>
        {displayedProducts.length > 0 && (
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="mac-select text-[10px] max-w-[180px] truncate"
          >
            <option value="">-- Pilih Produk Low Stock --</option>
            {displayedProducts.map((p) => {
              const label =
                activeRole === 'KASIR'
                  ? `${p.name} (Etalase: ${p.stock})`
                  : activeRole === 'GUDANG'
                  ? `${p.name} (Stok Gd: ${p.warehouseStock})`
                  : `${p.name} (Etalase: ${p.stock} | Gd: ${p.warehouseStock})`;
              return (
                <option key={p.id} value={p.id}>
                  {label}
                </option>
              );
            })}
          </select>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {activeRole !== 'GUDANG' && (
          <button
            onClick={() => onQuickTemplate('RESTOCK_REQ')}
            className="mac-btn px-2 py-1 text-[10px] font-black uppercase"
          >
            📢 Minta Restok
          </button>
        )}
        {activeRole !== 'KASIR' && (
          <button
            onClick={() => onQuickTemplate('LOW_STOCK_WARN')}
            className="mac-btn px-2 py-1 text-[10px] font-black uppercase text-red-700"
          >
            ⚠️ Stok Gudang Menipis
          </button>
        )}
        {(activeRole === 'GUDANG' || activeRole === 'ADMIN') && (
          <button
            onClick={() => onQuickTemplate('RESTOCK_DONE')}
            className="mac-btn px-2 py-1 text-[10px] font-black uppercase"
          >
            ✅ Restok Selesai
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Pesan ${roleShortLabel}...`}
          className="mac-input flex-1 px-3 py-1.5 text-xs font-semibold placeholder-gray-600"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="mac-btn px-3 py-1.5 text-xs font-black uppercase disabled:opacity-40 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
