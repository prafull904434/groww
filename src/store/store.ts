import { configureStore } from "@reduxjs/toolkit";
import widgets from "./widgetsSlice";

export const store = configureStore({
  reducer: { widgets },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["widgets/updateLayout"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
