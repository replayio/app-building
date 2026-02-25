import { createAppStore } from "@shared/store/store";
import { authReducer } from "@shared/auth/authSlice";
import { clientsReducer } from "./clientsSlice";
import { clientDetailReducer } from "./clientDetailSlice";
import { personDetailReducer } from "./personDetailSlice";

export const store = createAppStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    clientDetail: clientDetailReducer,
    personDetail: personDetailReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
