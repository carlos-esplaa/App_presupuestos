const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${detail}`);
  }
  return res.json();
}

export const api = {
  getBudget: () => request('/api/budget/current'),
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return request(`/api/transactions${qs ? `?${qs}` : ''}`);
  },
  getCategories: () => request('/api/categories'),
  createCategory: (body) => request('/api/categories', { method: 'POST', body: JSON.stringify(body) }),
  sync: () => request('/api/sync', { method: 'POST' }),
  getOnboardingAnalysis: () => request('/api/onboarding/analysis'),
  getInstitutions: (country = 'es') => request(`/api/setup/institutions?country=${country}`),
  createRequisition: (institution_id) =>
    request('/api/setup/requisition', { method: 'POST', body: JSON.stringify({ institution_id }) }),
  setupComplete: () => request('/api/setup/complete'),
};
