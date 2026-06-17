const env = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env;

export const API_BASE = (env?.VITE_API_URL || '/api').replace(/\/$/, '');

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const adminPassword = localStorage.getItem('veezo_admin_password');
  const adminToken = localStorage.getItem('veezo_admin_token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
      ...(adminPassword ? { 'x-admin-password': adminPassword } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { message?: string }).message || 'Request failed');
  }

  return data as T;
}

export async function apiFormRequest<T>(path: string, formData: FormData, method = 'POST'): Promise<T> {
  return apiRequest<T>(path, { method, body: formData });
}
