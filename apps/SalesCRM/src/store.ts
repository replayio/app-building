import { createAppStore } from "@shared/store/store";
import { authReducer } from "@shared/auth/authSlice";
import { clientsReducer } from "./clientsSlice";

export const store = createAppStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
