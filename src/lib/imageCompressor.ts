/**
 * Compresses an image file to WebP format with a maximum dimension and quality setting.
 * Returns a Promise containing the compressed WebP Data URL string and file size details.
 */
export interface CompressionResult {
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
}

export function compressImageToWebP(
  file: File,
  maxDimension = 500,
  quality = 0.75
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Proportional resizing if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal memproses canvas gambar'));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format with specified quality
        const dataUrl = canvas.toDataURL('image/webp', quality);

        // Calculate compressed size in KB
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const compressedSizeKb = Math.round((base64Length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          originalSizeKb,
          compressedSizeKb,
        });
      };

      img.onerror = () => reject(new Error('Gagal membaca format gambar'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}
