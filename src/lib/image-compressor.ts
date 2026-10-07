/**
 * SwapShield In-Browser Image Compressor
 * Converts raw smartphone gadget photos and diagnostic screenshots into lightweight WebP (<250KB)
 * using an off-screen HTML canvas prior to cloud upload.
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  quality?: number;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  savingsText: string;
}

/**
 * Format bytes into human-readable strings (e.g. 6.2MB, 184KB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${val >= 10 || i === 0 ? Math.round(val) : val.toFixed(1)}${sizes[i]}`;
}

/**
 * Compresses an image File to WebP format using an off-screen HTML5 Canvas.
 * Maintains proportional aspect ratio and falls back to original File on failure.
 *
 * @param file Raw input image File
 * @param options Compression parameters (defaults: maxWidth = 1600, quality = 0.75)
 * @returns Compressed File with .webp extension
 */
export async function compressImage(
  file: File,
  options?: ImageCompressionOptions
): Promise<File> {
  // Graceful fallback for non-browser environments or non-image files
  if (typeof window === 'undefined' || !file || !file.type.startsWith('image/')) {
    return file;
  }

  // Preserve animated GIFs or SVGs where canvas rendering degrades assets
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  const maxWidth = options?.maxWidth ?? 1600;
  const quality = options?.quality ?? 0.75;

  return new Promise<File>((resolve) => {
    try {
      const reader = new FileReader();

      reader.onerror = () => {
        console.warn('SwapShield Image Compressor: FileReader error, falling back to original');
        resolve(file);
      };

      reader.onload = (e) => {
        const img = new Image();

        img.onerror = () => {
          console.warn('SwapShield Image Compressor: Image load error, falling back to original');
          resolve(file);
        };

        img.onload = () => {
          try {
            let width = img.naturalWidth || img.width;
            let height = img.naturalHeight || img.height;

            // Maintain aspect ratio if downscaling
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              console.warn('SwapShield Image Compressor: Canvas 2D context unavailable');
              resolve(file);
              return;
            }

            // High-quality image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  console.warn('SwapShield Image Compressor: Canvas toBlob failed');
                  resolve(file);
                  return;
                }

                // If compression resulted in a larger file (rare, but possible with tiny icons), keep original
                if (blob.size >= file.size && file.type === 'image/webp') {
                  resolve(file);
                  return;
                }

                // Transform file name to have .webp extension
                const originalName = file.name;
                const dotIndex = originalName.lastIndexOf('.');
                const nameWithoutExt = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;
                const webpFileName = `${nameWithoutExt}.webp`;

                const compressedFile = new File([blob], webpFileName, {
                  type: 'image/webp',
                  lastModified: Date.now()
                });

                resolve(compressedFile);
              },
              'image/webp',
              quality
            );
          } catch (canvasErr) {
            console.warn('SwapShield Image Compressor: Error during canvas resize:', canvasErr);
            resolve(file);
          }
        };

        img.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('SwapShield Image Compressor: Exception during setup:', err);
      resolve(file);
    }
  });
}

/**
 * Compresses an image and returns rich metrics for progress display (savings, badge text).
 */
export async function compressImageWithStats(
  file: File,
  options?: ImageCompressionOptions
): Promise<CompressionResult> {
  const originalSize = file.size;
  const compressedFile = await compressImage(file, options);
  const compressedSize = compressedFile.size;

  const savingsBytes = Math.max(0, originalSize - compressedSize);
  const savingsPercentage = originalSize > 0 ? Math.round((savingsBytes / originalSize) * 100) : 0;
  const savingsText = `Compressed from ${formatFileSize(originalSize)} to ${formatFileSize(compressedSize)}`;

  return {
    file: compressedFile,
    originalSize,
    compressedSize,
    savingsPercentage,
    savingsText
  };
}
