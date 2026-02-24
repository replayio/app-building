import { createAppStore } from "@shared/store/store";
import { authReducer } from "@shared/auth/authSlice";
import { accountsReducer } from "./slices/accountsSlice";
import { transactionsReducer } from "./slices/transactionsSlice";
import { reportsReducer } from "./slices/reportsSlice";
import { budgetsReducer } from "./slices/budgetsSlice";

export const store = createAppStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    transactions: transactionsReducer,
    reports: reportsReducer,
    budgets: budgetsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
