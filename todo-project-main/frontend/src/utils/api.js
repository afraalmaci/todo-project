// Single place that knows the backend's base URL and how auth tokens are stored.
// REACT_APP_API_URL is read at build time (set it in Vercel's project settings for
// production); it falls back to the local Spring Boot dev server.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const TOKEN_KEY = 'todo_app_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

// Thin wrapper around fetch: prefixes the API base URL and attaches the JWT
// (if there is one) as an Authorization header. Callers pass a path like
// '/api/todos', not a full URL.
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  return fetch(`${API_BASE_URL}${path}`, config);
}

export { API_BASE_URL };
