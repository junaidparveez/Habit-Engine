import axiosClient from "./axiosClient";

const routineApi = {
  getRoutine: () => axiosClient.get("/routine"),
  createBlock: (data) => axiosClient.post("/routine", data),
  updateBlock: (id, data) => axiosClient.put(`/routine/${id}`, data),
  toggleBlock: (id) => axiosClient.post(`/routine/${id}/toggle`),
  deleteBlock: (id) => axiosClient.delete(`/routine/${id}`),
};

export default routineApi;
