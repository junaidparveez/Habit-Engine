import axiosClient from "./axiosClient";

const goalApi = {
  getAll: () => axiosClient.get("/goals"),
  getById: (id) => axiosClient.get(`/goals/${id}`),
  create: (data) => axiosClient.post("/goals", data),
  update: (id, data) => axiosClient.put(`/goals/${id}`, data),
  delete: (id) => axiosClient.delete(`/goals/${id}`),

  // Milestones
  addMilestone: (goalId, data) => axiosClient.post(`/goals/${goalId}/milestones`, data),
  toggleMilestone: (milestoneId) => axiosClient.post(`/goals/milestones/${milestoneId}/toggle`),
  deleteMilestone: (milestoneId) => axiosClient.delete(`/goals/milestones/${milestoneId}`),

  // Study Resources
  addResource: (data) => axiosClient.post("/goals/resources", data),
  getResources: () => axiosClient.get("/goals/resources"),
  deleteResource: (resourceId) => axiosClient.delete(`/goals/resources/${resourceId}`),
};

export default goalApi;
