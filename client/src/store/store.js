import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import cartReducer from "./slices/cartSlice.js";
import { catalogApi } from "./apis/catalogApi.js";
import { injectStore } from "../api/client.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(catalogApi.middleware),
});

injectStore(store);
