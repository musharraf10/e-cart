import { createSlice } from "@reduxjs/toolkit";

const tokenKey = "noorfit_token";

const initialState = {
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (typeof window !== "undefined") {
        localStorage.setItem(tokenKey, action.payload.token);
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem(tokenKey);
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

