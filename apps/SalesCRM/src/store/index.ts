import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import clientsReducer from './slices/clientsSlice'
import dealsReducer from './slices/dealsSlice'
import tasksReducer from './slices/tasksSlice'
import individualsReducer from './slices/individualsSlice'
import usersReducer from './slices/usersSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    deals: dealsReducer,
    tasks: tasksReducer,
    individuals: individualsReducer,
    users: usersReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
