import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    isPricingOpen: false,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    openPricing(state) {
      state.isPricingOpen = true;
    },
    closePricing(state) {
      state.isPricingOpen = false;
    },
  },
});

export const { setUser, clearUser, openPricing, closePricing } = authSlice.actions;
export default authSlice.reducer;