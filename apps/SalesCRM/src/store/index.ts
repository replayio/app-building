import { configureStore } from '@reduxjs/toolkit'
import clientsReducer from './clientsSlice'
import tasksReducer from './tasksSlice'

export const store = configureStore({
  reducer: {
    clients: clientsReducer,
    tasks: tasksReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
