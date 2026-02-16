// Detect production environment and set API base URL
function getApiBase() {
  // Use environment variable if set (for Vercel)
  if (import.meta?.env?.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // Check if we're in production (deployed on Vercel)
  const isProduction = window.location.hostname.includes('vercel.app') || 
                       window.location.hostname.includes('vercel.com') ||
                       import.meta.env.MODE === 'production';
  
  if (isProduction) {
    // Production backend URL on Render
    return 'https://hilcoe-rms.onrender.com';
  }
  
  // Development fallback
  return 'http://localhost:4000';
}

const BASE = getApiBase();
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


