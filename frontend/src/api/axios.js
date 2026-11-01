import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Essential: sends httpOnly cookies on every request
  headers: { 'Content-Type': 'application/json' },
});

// ── Token Refresh Interceptor ──────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // If 401 with TOKEN_EXPIRED code and not already retrying
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry &&
      !original.url.includes('/auth/refresh') &&
      !original.url.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue request while refresh is in flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(original))
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(original); // Retry original request
      } catch (refreshErr) {
        processQueue(refreshErr);
        // Refresh failed — redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
