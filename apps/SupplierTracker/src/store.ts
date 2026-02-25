import { createAppStore } from "@shared/store/store";
import { authReducer } from "@shared/auth/authSlice";
import { suppliersReducer } from "./slices/suppliersSlice";
import { ordersReducer } from "./slices/ordersSlice";

export const store = createAppStore({
  reducer: {
    auth: authReducer,
    suppliers: suppliersReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
