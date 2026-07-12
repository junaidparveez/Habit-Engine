import axiosClient from "./axiosClient";

const goalApi = {
  getAll: () => axiosClient.get("/goals"),
  getById: (id) => axiosClient.get(`/goals/${id}`),
  create: (data) => axiosClient.post("/goals", data),
  update: (id, data) => axiosClient.put(`/goals/${id}`, data),
  delete: (id) => axiosClient.delete(`/goals/${id}`),
};

export default goalApi;
