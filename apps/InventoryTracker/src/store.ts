import { createAppStore } from "@shared/store/store";
import { authReducer } from "@shared/auth/authSlice";
import { accountsReducer } from "./slices/accountsSlice";
import { materialsReducer } from "./slices/materialsSlice";
import { batchesReducer } from "./slices/batchesSlice";
import { transactionsReducer } from "./slices/transactionsSlice";
import { dashboardReducer } from "./slices/dashboardSlice";
import { categoriesReducer } from "./slices/categoriesSlice";

export const store = createAppStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    materials: materialsReducer,
    batches: batchesReducer,
    transactions: transactionsReducer,
    dashboard: dashboardReducer,
    categories: categoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
