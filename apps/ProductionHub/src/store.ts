import { createAppStore } from "@shared/store/store";
import { authReducer } from "@shared/auth/authSlice";
import { equipmentReducer } from "./slices/equipmentSlice";
import { recipesReducer } from "./slices/recipesSlice";

export const store = createAppStore({
  reducer: {
    auth: authReducer,
    equipment: equipmentReducer,
    recipes: recipesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
