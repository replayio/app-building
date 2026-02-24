import { configureStore } from '@reduxjs/toolkit';
import accountsReducer from './store/accountsSlice';
import materialsReducer from './store/materialsSlice';
import batchesReducer from './store/batchesSlice';
import transactionsReducer from './store/transactionsSlice';
import categoriesReducer from './store/categoriesSlice';
import dashboardReducer from './store/dashboardSlice';
import uiReducer from './store/uiSlice';

export const store = configureStore({
  reducer: {
    accounts: accountsReducer,
    materials: materialsReducer,
    batches: batchesReducer,
    transactions: transactionsReducer,
    categories: categoriesReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
