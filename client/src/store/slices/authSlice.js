import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const tokenKey = "noorfit_token";
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  const token = typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null;

  if (!token) {
    try {
      const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
      const profile = await axios.get(`${baseURL}/users/profile`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${data.token}` },
      });
      return { user: profile.data, token: data.token };
    } catch {
      return { user: null, token: null };
    }
  }

  try {
    const { data } = await axios.get(`${baseURL}/users/profile`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { user: data, token };
  } catch {
    try {
      const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
      const profile = await axios.get(`${baseURL}/users/profile`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${data.token}` },
      });
      return { user: profile.data, token: data.token };
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem(tokenKey);
      }
      return { user: null, token: null };
    }
  }
});

const initialState = {
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null,
  isInitializing: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isInitializing = false;

      if (typeof window !== "undefined") {
        localStorage.setItem(tokenKey, action.payload.token);
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isInitializing = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem(tokenKey);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isInitializing = false;
        if (typeof window !== "undefined") {
          if (action.payload.token) {
            localStorage.setItem(tokenKey, action.payload.token);
          } else {
            localStorage.removeItem(tokenKey);
          }
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isInitializing = false;
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
