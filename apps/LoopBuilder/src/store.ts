import { configureStore } from '@reduxjs/toolkit';
import appsReducer from './slices/appsSlice';
import appDetailReducer from './slices/appDetailSlice';
import requestReducer from './slices/requestSlice';

export const store = configureStore({
  reducer: {
    apps: appsReducer,
    appDetail: appDetailReducer,
    request: requestReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
