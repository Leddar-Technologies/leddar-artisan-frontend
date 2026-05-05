import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types because they contain non-serializable Files
        ignoredActions: [
          "auth/registerArtisan/pending",
          "auth/registerArtisan/fulfilled",
        ],
      },
    }),
});
