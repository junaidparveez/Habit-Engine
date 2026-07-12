import axios from "axios";
import { API_BASE_URL } from "../constants";

/**
 * Configured Axios instance for all API communication.
 *
 * Features:
 * - Base URL pointing to the backend API
 * - JSON content type by default
 * - 10-second timeout
 * - Request interceptor attaches JWT token
 * - Response interceptor handles 401 token refresh with queue pattern
 */
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoints that should NOT have Authorization headers
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh"];

// --- Request Interceptor ---
axiosClient.interceptors.request.use(
  (config) => {
    const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isAuthEndpoint) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Token Refresh Queue Pattern ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// --- Response Interceptor ---
axiosClient.interceptors.response.use(
  (response) => {
    // Return the API response data directly (ApiResponse envelope)
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 — attempt token refresh (skip if the failing request is itself a refresh)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !AUTH_ENDPOINTS.some((ep) => originalRequest.url?.includes(ep))
    ) {
      if (isRefreshing) {
        // Another refresh is in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token — force logout
        isRefreshing = false;
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Use raw axios to avoid interceptor loops
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const { token: newToken, refreshToken: newRefreshToken } =
          response.data.data;

        localStorage.setItem("token", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update the default header
        axiosClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        // Process all queued requests with the new token
        processQueue(null, newToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Extract meaningful error from the API response envelope
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    console.error(`API Error: ${message}`, error);

    return Promise.reject({
      message,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    });
  }
);

export default axiosClient;
