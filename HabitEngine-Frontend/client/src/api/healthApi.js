import axiosClient from "./axiosClient";

/**
 * Health API service.
 * Used to verify backend connectivity.
 */
const healthApi = {
  /**
   * Check if the backend is running.
   * @returns {Promise<Object>} Health check response
   */
  check: () => axiosClient.get("/health"),
};

export default healthApi;
