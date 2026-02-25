import { createAppStore } from "@shared/store/store";
import { authReducer } from "@shared/auth/authSlice";

export const store = createAppStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
