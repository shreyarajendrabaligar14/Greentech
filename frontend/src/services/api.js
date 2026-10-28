/**
 * API service for CarbonTrack AI
 * Handles all REST API communication with FastAPI backend.
 * Supports auto-detection between port 8081 and 8000 with environment variable overrides.
 */

const AUTH_TOKEN_KEY = 'carbontrack_token';

// Normalize configured URL or fallback to IPv4 127.0.0.1:8081
const envUrl = import.meta.env.VITE_API_URL;
let resolvedBaseUrl = envUrl ? envUrl.replace('localhost', '127.0.0.1') : 'http://127.0.0.1:8081';

export function getApiBaseUrl() {
  return resolvedBaseUrl;
}

export function setApiBaseUrl(url) {
  resolvedBaseUrl = url;
}

function parseErrorMessage(errJson, res) {
  if (!errJson) return `Request failed: ${res.status} ${res.statusText}`;
  if (errJson.detail) {
    if (typeof errJson.detail === 'string') return errJson.detail;
    if (Array.isArray(errJson.detail)) {
      return errJson.detail.map(d => d.msg || `${d.loc?.join('.')}: ${d.type}`).join(', ');
    }
    return JSON.stringify(errJson.detail);
  }
  if (errJson.message) return errJson.message;
  return `Request failed with status ${res.status}`;
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const candidateUrls = [
    resolvedBaseUrl,
    resolvedBaseUrl.includes(':8081') ? resolvedBaseUrl.replace(':8081', ':8000') : resolvedBaseUrl.replace(':8000', ':8081'),
    'http://127.0.0.1:8081',
    'http://127.0.0.1:8000',
    'http://localhost:8081',
    'http://localhost:8000',
  ];
  // Deduplicate
  const uniqueUrls = [...new Set(candidateUrls)];

  let lastError = null;

  for (let i = 0; i < uniqueUrls.length; i++) {
    const base = uniqueUrls[i];
    const url = `${base}${endpoint}`;
    try {
      const res = await fetch(url, config);
      if (!res.ok) {
        let errJson = null;
        try {
          errJson = await res.json();
        } catch {
          // ignore json parse error
        }
        const errMsg = parseErrorMessage(errJson, res);
        throw new Error(errMsg);
      }
      resolvedBaseUrl = base;
      return await res.json();
    } catch (error) {
      lastError = error;
      // If it's an HTTP error (status returned and error thrown with message), don't retry other hosts
      if (error.message && !error.message.includes('fetch') && !error.message.includes('NetworkError') && !error.message.includes('Failed to fetch')) {
        throw error;
      }
      // Connection failed, continue to next candidate host/port
    }
  }

  console.warn(`[CarbonTrack API] Error connecting to ${endpoint}:`, lastError?.message);
  throw new Error('Unable to connect to CarbonTrack server. Please verify the backend is running at http://127.0.0.1:8081.');
}

export const api = {
  // Auth
  login: (email, password) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (email, fullName, password) => request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, full_name: fullName, password }),
  }),
  getMe: () => request('/api/auth/me'),

  // Health
  checkHealth: () => request('/api/health'),

  // Activities / Calculations
  getActivities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/activities${query ? `?${query}` : ''}`);
  },
  createActivity: (activityData) => request('/api/activities', {
    method: 'POST',
    body: JSON.stringify(activityData),
  }),
  deleteActivity: (id) => request(`/api/activities/${id}`, {
    method: 'DELETE',
  }),

  // Server-side calculation verification (POST /api/calculate)
  calculate: (calcData) => request('/api/calculate', {
    method: 'POST',
    body: JSON.stringify(calcData),
  }),

  // Dashboard & Analytics
  getDashboardSummary: () => request('/api/dashboard/summary'),
  getAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/analytics${query ? `?${query}` : ''}`);
  },

  // Reduction Targets
  getTargets: () => request('/api/targets'),
  saveTarget: (targetData) => request('/api/targets', {
    method: 'POST',
    body: JSON.stringify(targetData),
  }),

  // Challenges
  getChallenges: () => request('/api/challenges'),
  toggleChallenge: (id, completed) => request(`/api/challenges/${id}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ completed }),
  }),

  // Leaderboard
  getLeaderboard: () => request('/api/leaderboard'),

  // Settings & Reset
  getSettings: () => request('/api/settings'),
  saveSettings: (settingsData) => request('/api/settings', {
    method: 'POST',
    body: JSON.stringify(settingsData),
  }),
  resetData: () => request('/api/data/reset', {
    method: 'POST',
  }),
};
