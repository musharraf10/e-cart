import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import cartReducer from "./slices/cartSlice.js";
import { catalogApi } from "./apis/catalogApi.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(catalogApi.middleware),
});
