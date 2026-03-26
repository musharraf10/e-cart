import axios from "axios";
import { store } from "../store/store.js";
import { logout, setCredentials } from "../store/slices/authSlice.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token || (typeof window !== "undefined" ? localStorage.getItem("noorfit_token") : null);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry) {
      throw error;
    }

    const status = error.response?.status;
    const isRefreshCall = originalRequest.url?.includes("/auth/refresh");

    if (status !== 401 || isRefreshCall) {
      throw error;
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api.post("/auth/refresh").finally(() => {
          refreshPromise = null;
        });
      }

      const { data } = await refreshPromise;
      const user = store.getState().auth.user;
      store.dispatch(setCredentials({ user, token: data.token }));
      originalRequest.headers.Authorization = `Bearer ${data.token}`;
      return api(originalRequest);
    } catch (refreshError) {
      store.dispatch(logout());
      throw refreshError;
    }
  },
);

export default api;
