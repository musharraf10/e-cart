import axios from "axios";
import { store } from "../store/store.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://10.16.38.220:5000/api",
});

api.interceptors.request.use((config) => {
  const state = store.getState();
  const token =
    state.auth.token ||
    (typeof window !== "undefined"
      ? localStorage.getItem("noorfit_token")
      : null);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
