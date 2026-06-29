const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('auth_token');
}

export function setToken(token) {
  localStorage.setItem('auth_token', token);
}

export function clearToken() {
  localStorage.removeItem('auth_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new Event('auth:logout'));
    throw new Error('Sesión expirada');
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${detail}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  login: (username, password) => {
    const body = new URLSearchParams({ username, password });
    return fetch(`${BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }).then(async (res) => {
      if (!res.ok) throw new Error('Usuario o contraseña incorrectos');
      return res.json();
    });
  },

  // Budget
  getBudget: () => request('/api/budget/current'),

  // Transactions
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return request(`/api/transactions${qs ? `?${qs}` : ''}`);
  },
  patchTransaction: (txId, body) =>
    request(`/api/transactions/${encodeURIComponent(txId)}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Categories
  getCategories: () => request('/api/categories'),
  createCategory: (body) => request('/api/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id, body) => request(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCategory: (id) => request(`/api/categories/${id}`, { method: 'DELETE' }),

  // Sync & Setup
  sync: () => request('/api/sync', { method: 'POST' }),
  getOnboardingAnalysis: () => request('/api/onboarding/analysis'),
  getInstitutions: (country = 'es') => request(`/api/setup/institutions?country=${country}`),
  createRequisition: (institution_id) =>
    request('/api/setup/requisition', { method: 'POST', body: JSON.stringify({ institution_id }) }),
  setupComplete: () => request('/api/setup/complete'),
};
