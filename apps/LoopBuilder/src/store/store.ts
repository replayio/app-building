import { configureStore } from '@reduxjs/toolkit'
import appsReducer from './appsSlice'
import requestReducer from './requestSlice'
import activityReducer from './activitySlice'
import statusReducer from './statusSlice'

export const store = configureStore({
  reducer: {
    apps: appsReducer,
    request: requestReducer,
    activity: activityReducer,
    status: statusReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
