// Centralized Axios instance (configure baseURL later)
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Minimal: relying on session cookie; no Authorization header needed

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // optionally clear token
      localStorage.removeItem('token');
      if (location.pathname !== '/login') {
        location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
