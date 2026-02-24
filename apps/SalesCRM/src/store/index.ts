import { configureStore } from '@reduxjs/toolkit'
import clientsReducer from './clientsSlice'
import tasksReducer from './tasksSlice'
import dealsReducer from './dealsSlice'

export const store = configureStore({
  reducer: {
    clients: clientsReducer,
    tasks: tasksReducer,
    deals: dealsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
