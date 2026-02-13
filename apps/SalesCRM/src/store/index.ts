import { configureStore } from '@reduxjs/toolkit'
import { clientsSlice } from './clientsSlice'
import { dealsSlice } from './dealsSlice'
import { tasksSlice } from './tasksSlice'
import { individualsSlice } from './individualsSlice'

export const store = configureStore({
  reducer: {
    clients: clientsSlice.reducer,
    deals: dealsSlice.reducer,
    tasks: tasksSlice.reducer,
    individuals: individualsSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
