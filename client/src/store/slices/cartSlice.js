import { createSlice } from "@reduxjs/toolkit";

const cartKey = "noorfit_cart";

const normalizeCartItem = (item = {}) => ({
  ...item,
  image: item.image || "",
});

const getInitialCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(cartKey);
    return stored ? JSON.parse(stored).map(normalizeCartItem) : [];
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
      const payload = normalizeCartItem(action.payload);
      const existing = state.items.find(
        (i) =>
          i.product === payload.product &&
          i.sku === payload.sku &&
          i.size === payload.size &&
          i.color === payload.color,
      );
      if (existing) {
        existing.qty += payload.qty;
        existing.image = payload.image || existing.image;
      } else {
        state.items.push(payload);
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
