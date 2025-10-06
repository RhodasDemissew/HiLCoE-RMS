const BASE = import.meta?.env?.VITE_API_BASE || 'http://localhost:4000';
export const API_BASE = BASE;

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(t) {
  if (!t) return localStorage.removeItem('token');
  localStorage.setItem('token', t);
}

export function api(path, opts = {}) {
  const headers = opts.headers || {};
  const t = getToken();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  // Default to no-store to avoid 304/empty-body issues on polling endpoints like /notifications
  const fetchOpts = { ...opts, headers, cache: opts.cache ?? 'no-store' };
  return fetch(`${BASE}${path}`, fetchOpts);
}


