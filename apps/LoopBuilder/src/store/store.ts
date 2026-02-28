import { configureStore } from '@reduxjs/toolkit'
import appsReducer from './appsSlice'
import requestReducer from './requestSlice'

export const store = configureStore({
  reducer: {
    apps: appsReducer,
    request: requestReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
