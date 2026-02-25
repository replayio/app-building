import { createAppStore } from "@shared/store/store";
import { authReducer } from "@shared/auth/authSlice";
import { clientsReducer } from "./clientsSlice";
import { clientDetailReducer } from "./clientDetailSlice";
import { personDetailReducer } from "./personDetailSlice";
import { dealsReducer } from "./dealsSlice";
import { dealDetailReducer } from "./dealDetailSlice";
import { tasksReducer } from "./tasksSlice";

export const store = createAppStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    clientDetail: clientDetailReducer,
    personDetail: personDetailReducer,
    deals: dealsReducer,
    dealDetail: dealDetailReducer,
    tasks: tasksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
