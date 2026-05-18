import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

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
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Registration failed",
      );
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Login failed");
    }
  },
);

export const updateKYC = createAsyncThunk(
  "auth/updateKYC",
  async (kycData, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/artisan/kyc`, kycData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "KYC update failed");
    }
  },
);

// --- SLICE ---

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null,
    token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
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
      state.token = null;
      state.success = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
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
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.success = true;
        if (typeof window !== "undefined") {
          localStorage.setItem("token", action.payload.data.token);
          localStorage.setItem(
            "user",
            JSON.stringify(action.payload.data.user),
          );
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update KYC
      .addCase(updateKYC.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateKYC.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          kycStatus: action.payload.kycStatus,
          bankAccount: action.payload.bankAccount,
        };
      })
      .addCase(updateKYC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAuth, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
