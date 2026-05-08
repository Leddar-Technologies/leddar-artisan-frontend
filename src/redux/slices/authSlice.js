import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Maps the frontend dropdown labels to the Prisma ArtisanSpecialty Enum
 */
const mapSpecialtyToEnum = (displayValue) => {
  if (!displayValue) return "BAGS";
  const val = displayValue.toLowerCase();

  if (val.includes("footwear") || val.includes("shoes")) return "SHOES";
  if (val.includes("bag")) return "BAGS";
  if (val.includes("wallet")) return "WALLETS";
  if (val.includes("belt")) return "BELTS";
  if (val.includes("jacket")) return "JACKETS";

  return "BAGS";
};

// --- THUNKS ---

export const registerArtisan = createAsyncThunk(
  "auth/registerArtisan",
  async (formData, { rejectWithValue }) => {
    try {
      const rawSpecialty = formData.get("specialty");
      if (rawSpecialty) {
        formData.set("specialty", mapSpecialtyToEnum(rawSpecialty));
      }

      const response = await axios.post(
        `${API_URL}/auth/register/artisan`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Registration failed",
      );
    }
  },
);

// FIX: Added the missing login function for your Login.tsx
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      // Assuming your backend returns { user, token }
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Login failed");
    }
  },
);

// --- SLICE ---

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetAuth: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    logout: (state) => {
      state.user = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register Artisan
      .addCase(registerArtisan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerArtisan.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(registerArtisan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // Store user data on success
        state.success = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAuth, logout } = authSlice.actions;
export default authSlice.reducer;
