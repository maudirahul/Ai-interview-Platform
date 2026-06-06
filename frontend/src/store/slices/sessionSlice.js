import { createSlice } from "@reduxjs/toolkit";

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    sessionId: null,
    role: null,
    roleLabel: null,
    level: null,
    questions: [],
    sessionStatus: null,
  },
  reducers: {
    setSession(state, action) {
      return { ...state, ...action.payload };
    },
    clearSession() {
      return {
        sessionId: null,
        role: null,
        roleLabel: null,
        level: null,
        questions: [],
        sessionStatus: null,
      };
    },
  },
});

export const { setSession, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
