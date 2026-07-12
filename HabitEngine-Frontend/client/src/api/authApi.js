import axiosClient from "./axiosClient";

/**
 * Authentication API methods.
 *
 * Note: axiosClient's response interceptor returns `response.data` directly,
 * so the result of each call is the ApiResponse envelope:
 * { success, message, data, timestamp }
 */
const authApi = {
  login: (data) => axiosClient.post("/auth/login", data),
  register: (data) => axiosClient.post("/auth/register", data),
  refresh: (data) => axiosClient.post("/auth/refresh", data),
  me: () => axiosClient.get("/auth/me"),
};

export default authApi;
