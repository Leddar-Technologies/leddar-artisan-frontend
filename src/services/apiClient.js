"use client";

/**
 * Axios instance with automatic JWT refresh.
 *
 * - Attaches the stored access token to every request.
 * - On 401, silently exchanges the refresh token for a new access token
 *   (POST /auth/refresh), stores the new tokens, then retries the original
 *   request once.
 * - If the refresh itself fails (refresh token expired / revoked), clears
 *   storage and redirects to /login.
 */

import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.myleddar.com/api/v1";

const apiClient = axios.create({ baseURL: BASE_URL });

// ─── Request interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor ────────────────────────────────────────────────────
let _refreshing = false;
let _queue = []; // pending requests waiting for the new token

function processQueue(error, token = null) {
  _queue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  _queue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only handle 401s that haven't already been retried
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh the refresh call itself
    if (original.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (_refreshing) {
      // Queue this request until the ongoing refresh completes
      return new Promise((resolve, reject) => {
        _queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    _refreshing = true;

    try {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refreshToken")
          : null;

      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const newToken        = data.data.token;
      const newRefreshToken = data.data.refreshToken;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", newToken);
        if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
      }

      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Refresh failed — clear session and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      _refreshing = false;
    }
  }
);

export default apiClient;
