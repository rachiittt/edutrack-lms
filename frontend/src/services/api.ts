import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Ensure the URL ends with /api for production environments
if (API_BASE_URL && typeof API_BASE_URL === 'string' && !API_BASE_URL.endsWith('/api') && !API_BASE_URL.endsWith('/api/')) {
  API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edutrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('edutrack_token');
      localStorage.removeItem('edutrack_user');
      
      const isAuthUrl = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthUrl) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
export default api;
