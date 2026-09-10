import React, { useState } from 'react';
import { PackageX } from 'lucide-react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackClassName = 'w-full h-full flex items-center justify-center bg-slate-100 text-slate-400',
}) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={fallbackClassName}>
        <PackageX className="w-5 h-5 opacity-60" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};
