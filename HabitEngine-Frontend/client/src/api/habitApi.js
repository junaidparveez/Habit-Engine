import axiosClient from "./axiosClient";

/**
 * Habit API service.
 */
const habitApi = {
  /**
   * Fetch all habits.
   * @param {boolean} [activeOnly] Optional filter to return only active habits
   * @returns {Promise<Object>} API Response containing HabitResponse list
   */
  getAll: (activeOnly) => {
    const params = activeOnly !== undefined ? { activeOnly } : {};
    return axiosClient.get("/habits", { params });
  },

  /**
   * Fetch a single habit by ID.
   * @param {number} id
   * @returns {Promise<Object>} API Response containing HabitResponse
   */
  getById: (id) => axiosClient.get(`/habits/${id}`),

  /**
   * Create a new habit.
   * @param {Object} data CreateHabitRequest payload
   * @returns {Promise<Object>} API Response containing created HabitResponse
   */
  create: (data) => axiosClient.post("/habits", data),

  /**
   * Update an existing habit.
   * @param {number} id
   * @param {Object} data UpdateHabitRequest payload
   * @returns {Promise<Object>} API Response containing updated HabitResponse
   */
  update: (id, data) => axiosClient.put(`/habits/${id}`, data),

  /**
   * Delete a habit.
   * @param {number} id
   * @returns {Promise<Object>} API Response containing success status
   */
  delete: (id) => axiosClient.delete(`/habits/${id}`),

  /**
   * Mark a habit as completed for a given date.
   * @param {number} id 
   * @param {Object} data CreateHabitCompletionRequest { completionDate, note }
   * @returns {Promise<Object>} API Response
   */
  markCompleted: (id, data) => axiosClient.post(`/habits/${id}/completions`, data),

  /**
   * Unmark a habit completion for a given date.
   * @param {number} id 
   * @param {string} date YYYY-MM-DD string
   * @returns {Promise<Object>} API Response
   */
  unmarkCompleted: (id, date) => axiosClient.delete(`/habits/${id}/completions`, { params: { date } }),

  /**
   * Get completions for a habit.
   * @param {number} id 
   * @returns {Promise<Object>} API Response containing list of completions
   */
  getCompletions: (id) => axiosClient.get(`/habits/${id}/completions`),
};

export default habitApi;
