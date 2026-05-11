import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import jobsReducer from "./slices/jobsSlice";

/**
 * Redux Store Configuration
 * Configured for standard JavaScript to ensure compatibility with AWS Amplify.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer, // Access via useSelector((state) => state.jobs)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        /**
         * We ignore these action types for the serializable check
         * because they involve FormData/File objects (e.g., identity cards, product videos)
         * which are not plain serializable objects.
         */
        ignoredActions: [
          "auth/registerArtisan/pending",
          "auth/registerArtisan/fulfilled",
          "jobs/uploadMedia/pending",
        ],
      },
    }),
});
