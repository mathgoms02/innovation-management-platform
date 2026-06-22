import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const clearSessionAndRedirect = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
};

// --- Refresh token handling -------------------------------------------------
// Quando uma request retorna 401, tentamos renovar o access token usando o
// refresh token. Requests concorrentes que falharem durante a renovação são
// enfileiradas e reexecutadas após o refresh. Se a renovação falhar, a sessão
// é encerrada e o usuário é redirecionado ao login.
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

const flushQueue = (token: string | null) => {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isUnauthorized = error.response?.status === 401;
    const isRefreshCall = originalRequest?.url?.includes('/users/token/refresh/');

    if (!isUnauthorized || originalRequest._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Aguarda o refresh em andamento e reexecuta a request.
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const { data } = await axios.post(`${baseURL}/users/token/refresh/`, {
        refresh: refreshToken,
      });
      const newAccess = data.access as string;
      localStorage.setItem('access_token', newAccess);
      flushQueue(newAccess);
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(null);
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
