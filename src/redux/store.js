import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import jobsReducer from "./slices/jobsSlice"; // Import the new slice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer, // This defines state.jobs in your RootState
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types because they contain non-serializable Files
        ignoredActions: [
          "auth/registerArtisan/pending",
          "auth/registerArtisan/fulfilled",
          "jobs/uploadMedia/pending", // Add this if you handle file uploads in jobs
        ],
      },
    }),
});
