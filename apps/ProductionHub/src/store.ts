import { createAppStore } from "@shared/store/store";
import { authReducer } from "@shared/auth/authSlice";
import { equipmentReducer } from "./slices/equipmentSlice";

export const store = createAppStore({
  reducer: {
    auth: authReducer,
    equipment: equipmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
