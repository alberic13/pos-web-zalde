import React from 'react';
import { Category } from '../../types';
import { FolderTree, Edit2, Trash2 } from 'lucide-react';

interface CategoryCardGridProps {
  loading: boolean;
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

export const CategoryCardGrid: React.FC<CategoryCardGridProps> = ({
  loading,
  categories,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 mac-card p-4 animate-pulse" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-16 mac-window p-6 text-black space-y-2">
        <FolderTree className="w-10 h-10 mx-auto text-gray-600 mb-1" />
        <p className="text-xs font-black uppercase">Belum ada kategori</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {categories.map((cat) => (
        <div key={cat.id} className="mac-card p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white border border-black flex items-center justify-center font-bold">
              <FolderTree className="w-4 h-4 text-black" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-black">{cat.name}</h4>
              <span className="text-[10px] text-gray-800 font-bold">
                {cat.productCount || 0} Produk terkait
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(cat)} className="mac-btn px-2 py-1 text-xs" title="Edit">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(cat)}
              className="mac-btn px-2 py-1 text-xs text-red-700"
              title="Hapus"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
