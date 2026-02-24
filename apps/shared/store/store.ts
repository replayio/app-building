import { configureStore, type Reducer, type Middleware } from "@reduxjs/toolkit";

export interface CreateStoreOptions {
  reducer: Record<string, Reducer>;
  middleware?: Middleware[];
}

/**
 * Create a Redux store with standard configuration shared across all apps.
 * Each app provides its own reducers and optional middleware.
 */
export function createAppStore({ reducer, middleware = [] }: CreateStoreOptions) {
  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(...middleware),
  });
}
