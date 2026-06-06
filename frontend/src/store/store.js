import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import sessionReducer from './slices/sessionSlice'
import interviewReducer from './slices/interviewSlice'
import motionReducer from './slices/motionSlice'
import reportReducer from './slices/reportSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    interview: interviewReducer,
    motion: motionReducer,
    report: reportReducer,
  },
})