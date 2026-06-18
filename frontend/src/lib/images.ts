import { API_BASE } from './api';

export const MAX_IMAGE_BYTES = 300 * 1024;
export const MAX_IMAGE_LABEL = '300KB';

const ASSET_BASE = API_BASE.replace(/\/api$/, '');

export function imageUrl(path?: string) {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (normalized.startsWith('/uploads/')) {
    return ASSET_BASE ? `${ASSET_BASE}${normalized}` : normalized;
  }

  return normalized;
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Only image files are allowed.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `"${file.name}" is ${Math.round(file.size / 1024)}KB. Maximum size is ${MAX_IMAGE_LABEL}.`;
  }
  return null;
}

export function validateImageFiles(files: File[]): string | null {
  for (const file of files) {
    const error = validateImageFile(file);
    if (error) return error;
  }
  return null;
}
