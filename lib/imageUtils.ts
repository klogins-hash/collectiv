/**
 * Image Utilities for Collectiv Wiki
 * Handles image optimization, processing, and metadata
 */

interface ImageMetadata {
  url: string;
  altText: string;
  caption?: string;
  width: number;
  height: number;
  size: number;
  format: string;
  uploadedAt?: string;
}

interface ImageOptimization {
  original: ImageMetadata;
  optimized: {
    small: string; // 300px
    medium: string; // 768px
    large: string; // 1200px
    webp: {
      small: string;
      medium: string;
      large: string;
    };
  };
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: File,
  maxSizeInMB: number = 10
): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeInMB}MB limit`,
    };
  }

  return { valid: true };
}

/**
 * Get image format from file type
 */
export function getImageFormat(mimeType: string): string {
  const formatMap: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
  };

  return formatMap[mimeType] || 'unknown';
}

/**
 * Calculate image dimensions while maintaining aspect ratio
 */
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number
): { width: number; height: number } {
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalHeight / originalWidth;
  return {
    width: maxWidth,
    height: Math.round(maxWidth * aspectRatio),
  };
}

/**
 * Generate responsive image URLs
 */
export function generateResponsiveImageUrls(
  baseUrl: string,
  format: string
): string[] {
  const sizes = [300, 768, 1200];
  return sizes.map((size) => `${baseUrl}?w=${size}&q=80&f=${format}`);
}

/**
 * Generate WebP fallback URLs
 */
export function generateWebPUrls(baseUrl: string): string[] {
  const sizes = [300, 768, 1200];
  return sizes.map((size) => `${baseUrl}?w=${size}&q=80&f=webp`);
}

/**
 * Create image optimization config
 */
export function createImageOptimizationConfig(
  imageMeta: ImageMetadata
): ImageOptimization {
  const baseUrl = imageMeta.url.split('?')[0]; // Remove any existing params

  return {
    original: imageMeta,
    optimized: {
      small: `${baseUrl}?w=300&q=80`,
      medium: `${baseUrl}?w=768&q=80`,
      large: `${baseUrl}?w=1200&q=80`,
      webp: {
        small: `${baseUrl}?w=300&q=80&f=webp`,
        medium: `${baseUrl}?w=768&q=80&f=webp`,
        large: `${baseUrl}?w=1200&q=80&f=webp`,
      },
    },
  };
}

/**
 * Generate srcset string for responsive images
 */
export function generateSrcset(baseUrl: string): string {
  const sizes = [
    { size: 300, descriptor: '300w' },
    { size: 768, descriptor: '768w' },
    { size: 1200, descriptor: '1200w' },
  ];

  return sizes.map(({ size, descriptor }) => `${baseUrl}?w=${size}&q=80 ${descriptor}`).join(', ');
}

/**
 * Generate picture element HTML for responsive images
 */
export function generatePictureElement(
  imageMeta: ImageMetadata,
  className?: string
): string {
  const baseUrl = imageMeta.url.split('?')[0];

  return `
    <picture>
      <source
        srcSet="${generateSrcset(baseUrl).split(', ').slice(0, 2).join(', ')}"
        type="image/webp"
      >
      <img
        src="${baseUrl}?w=768&q=80"
        srcSet="${generateSrcset(baseUrl)}"
        alt="${imageMeta.altText}"
        ${imageMeta.caption ? `data-caption="${imageMeta.caption}"` : ''}
        ${imageMeta.width ? `width="${imageMeta.width}"` : ''}
        ${imageMeta.height ? `height="${imageMeta.height}"` : ''}
        ${className ? `class="${className}"` : ''}
      />
    </picture>
  `.trim();
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Extract image metadata from File
 */
export async function extractImageMetadata(
  file: File,
  url: string
): Promise<ImageMetadata> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          url,
          altText: file.name.replace(/\.[^/.]+$/, ''),
          width: img.width,
          height: img.height,
          size: file.size,
          format: getImageFormat(file.type),
          uploadedAt: new Date().toISOString(),
        });
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Create figure element with image
 */
export function createFigureElement(
  imageMeta: ImageMetadata,
  className?: string
): string {
  return `
    <figure ${className ? `class="${className}"` : ''}>
      ${generatePictureElement(imageMeta, 'rounded-lg shadow-md')}
      ${imageMeta.caption ? `<figcaption>${imageMeta.caption}</figcaption>` : ''}
    </figure>
  `.trim();
}

/**
 * Validate image aspect ratio
 */
export function validateAspectRatio(
  width: number,
  height: number,
  minRatio: number = 0.5,
  maxRatio: number = 2
): boolean {
  const ratio = width / height;
  return ratio >= minRatio && ratio <= maxRatio;
}

export default {
  validateImageFile,
  getImageFormat,
  calculateDimensions,
  generateResponsiveImageUrls,
  generateWebPUrls,
  createImageOptimizationConfig,
  generateSrcset,
  generatePictureElement,
  formatFileSize,
  extractImageMetadata,
  createFigureElement,
  validateAspectRatio,
};
