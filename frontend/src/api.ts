const API_URL: string = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.headers) {
    const h = options.headers as HeadersInit;
    if (h instanceof Headers) {
      h.forEach((v, k) => {
        headers[k] = v as string;
      });
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
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || 'Erro na requisição'));
  return data;
}

export const api = {
  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dateOfBirth?: string | null;
  }) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  login: async (payload: {
    email: string;
    password: string
  }) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setToken((data as any).token);
    return data as any;
  },
  me: () => request('/auth/me'),
  logout: () => setToken(null),
  forgotPassword: (payload: {
    email: string
  }) => request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload)
    }),
  resetPassword: (payload: {
    token: string;
    newPassword: string
  }) => request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload)
    }),
};
