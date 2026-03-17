import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const tokenKey = "noorfit_token";

export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null;

  if (!token) {
    return { user: null, token: null };
  }

  const baseURL =
    import.meta.env.VITE_API_BASE_URL || "http://10.16.38.220:5000/api";

  try {
    const { data } = await axios.get(`${baseURL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { user: data, token };
  } catch {
    if (typeof window !== "undefined") {
      localStorage.removeItem(tokenKey);
    }

    return { user: null, token: null };
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
