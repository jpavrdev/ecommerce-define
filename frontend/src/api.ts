const API_URL: string =
  (import.meta as any).env?.VITE_API_URL ||
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:4000/api');

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (options.headers) {
    const h = options.headers as HeadersInit;
    if (h instanceof Headers) {
      h.forEach((v, k) => { headers[k] = v as string; });
    } else if (Array.isArray(h)) {
      for (const [k, v] of h) headers[k] = v as string;
    } else {
      Object.assign(headers, h as Record<string, string>);
    }
  }

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = typeof data === 'string' ? data : (data.message || 'Erro na requisição');
    const err: any = new Error(msg);
    if (data && typeof data === 'object' && 'errors' in (data as any)) err.details = (data as any).errors;
    throw err;
  }
  return data;
}

function buildQuery(params?: Record<string, any>) {
  if (!params) return '';
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  register: (payload: { firstName: string; lastName: string; email: string; password: string; confirmPassword: string; dateOfBirth?: string | null; }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: async (payload: { email: string; password: string }) => {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    setToken((data as any).token);
    try {
      const uid = (data as any)?.user?.id;
      if (uid !== undefined) {
        localStorage.setItem('currentUserId', String(uid));
        window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: { id: uid } }));
      }
    } catch {}
    return data as any;
  },
  me: () => request('/auth/me'),
  logout: () => { setToken(null); try { localStorage.removeItem('currentUserId'); window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: { id: null } })); } catch {} },
  forgotPassword: (payload: { email: string }) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (payload: { token: string; newPassword: string }) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  createProduct: (payload: FormData | { name: string; sku: string; price: number; description?: string; brandId?: number; brandName?: string; imageUrl?: string; images?: string[]; characteristics?: any; specifications?: any; categoryId?: number; }) =>
    payload instanceof FormData
      ? request('/products', { method: 'POST', body: payload })
      : request('/products', { method: 'POST', body: JSON.stringify(payload) }),
  listProducts: (params?: { categoryId?: number | string; q?: string; limit?: number; offset?: number }) => request(`/products${buildQuery(params)}`),
  getProduct: (id: number | string) => request(`/products/${id}`),
  listCategories: () => request('/categories'),
  listSubcategoriesWithCount: (parentId: number | string) => request(`/categories/${parentId}/children-with-count`),
};

export function productImageUrl(id: number | string) {
  return `${API_URL}/products/${id}/image`;
}
