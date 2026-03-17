import { createSlice } from "@reduxjs/toolkit";

const cartKey = "noorfit_cart";

const getInitialCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(cartKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const initialState = {
  items: getInitialCart(),
};

const persist = (items) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(cartKey, JSON.stringify(items));
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const existing = state.items.find(
        (i) =>
          i.product === action.payload.product &&
          i.sku === action.payload.sku &&
          i.size === action.payload.size &&
          i.color === action.payload.color,
      );
      if (existing) {
        existing.qty += action.payload.qty;
      } else {
        state.items.push(action.payload);
      }
      persist(state.items);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i, idx) => idx !== action.payload);
      persist(state.items);
    },
    updateQty(state, action) {
      const { index, qty } = action.payload;
      if (state.items[index]) {
        state.items[index].qty = qty;
      }
      persist(state.items);
    },
    clearCart(state) {
      state.items = [];
      persist(state.items);
    },
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
