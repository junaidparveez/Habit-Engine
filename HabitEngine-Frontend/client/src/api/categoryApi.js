import axiosClient from "./axiosClient";

/**
 * Category API service.
 */
const categoryApi = {
  /**
   * Fetch all categories.
   * @returns {Promise<Object>} API Response containing CategoryResponse list
   */
  getAll: () => axiosClient.get("/categories"),

  /**
   * Fetch a single category by ID.
   * @param {number} id
   * @returns {Promise<Object>} API Response containing CategoryResponse
   */
  getById: (id) => axiosClient.get(`/categories/${id}`),

  /**
   * Create a new category.
   * @param {Object} data CreateCategoryRequest payload
   * @returns {Promise<Object>} API Response containing created CategoryResponse
   */
  create: (data) => axiosClient.post("/categories", data),

  /**
   * Update an existing category.
   * @param {number} id
   * @param {Object} data CreateCategoryRequest payload
   * @returns {Promise<Object>} API Response containing updated CategoryResponse
   */
  update: (id, data) => axiosClient.put(`/categories/${id}`, data),

  /**
   * Delete a category.
   * @param {number} id
   * @returns {Promise<Object>} API Response containing success status
   */
  delete: (id) => axiosClient.delete(`/categories/${id}`),
};

export default categoryApi;
