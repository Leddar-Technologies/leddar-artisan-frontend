import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Maps the frontend dropdown labels to the Prisma ArtisanSpecialty Enum
 */
const mapSpecialtyToEnum = (displayValue) => {
  if (!displayValue) return "BAGS"; // Fallback
  const val = displayValue.toLowerCase();

  if (val.includes("footwear") || val.includes("shoes")) return "SHOES";
  if (val.includes("bag")) return "BAGS";
  if (val.includes("wallet")) return "WALLETS";
  if (val.includes("belt")) return "BELTS";
  if (val.includes("jacket")) return "JACKETS";

  return "BAGS"; // Default fallback to match your schema
};

export const registerArtisan = createAsyncThunk(
  "auth/registerArtisan",
  async (formData, { rejectWithValue }) => {
    try {
      // 1. Extract specialty from FormData and map it
      const rawSpecialty = formData.get("specialty");
      if (rawSpecialty) {
        formData.set("specialty", mapSpecialtyToEnum(rawSpecialty));
      }

      const response = await axios.post(
        `${API_URL}/auth/register/artisan`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "An error occurred");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // Added to track logged in state
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
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { resetAuth } = authSlice.actions;
export default authSlice.reducer;
