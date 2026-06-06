import { createSlice } from "@reduxjs/toolkit";

const motionSlice = createSlice({
  name: "motion",
  initialState: {
    integrityScore: 100,
    lookAwayCount: 0,
    phoneDetectedCount: 0,
    multiplePersonCount: 0,
    isMonitoring: false,
  },
  reducers: {
    updateMotion(state, action) {
      return { ...state, ...action.payload };
    },
    setMonitoring(state, action) {
      state.isMonitoring = action.payload;
    },
    resetMotion() {
      return {
        integrityScore: 100,
        lookAwayCount: 0,
        phoneDetectedCount: 0,
        multiplePersonCount: 0,
        isMonitoring: false,
      };
    },
  },
});

export const { updateMotion, setMonitoring, resetMotion } = motionSlice.actions;
export default motionSlice.reducer;