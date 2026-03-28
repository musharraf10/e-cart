import axios from "axios";
import { logout, setCredentials } from "../store/slices/authSlice.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

let refreshPromise = null;
let storeRef = null;

export const injectStore = (store) => {
  storeRef = store;
};

const getAccessToken = () => {
  if (storeRef) {
    return storeRef.getState().auth.token;
  }

  if (typeof window !== "undefined") {
    return localStorage.getItem("noorfit_token");
  }

  return null;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();

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
    const url = originalRequest.url || "";
    const isRefreshCall = url.includes("/auth/refresh");
    const isLogoutCall = url.includes("/auth/logout");

    if (status !== 401 || isRefreshCall || isLogoutCall) {
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
      const user = storeRef?.getState().auth.user ?? null;

      if (storeRef) {
        storeRef.dispatch(setCredentials({ user, token: data.token }));
      }

      originalRequest.headers.Authorization = `Bearer ${data.token}`;
      return api(originalRequest);
    } catch (refreshError) {
      try {
        await api.post("/auth/logout");
      } catch {
        // best effort cookie cleanup
      }

      if (storeRef) {
        storeRef.dispatch(logout());
      }

      throw refreshError;
    }
  },
);

export default api;
