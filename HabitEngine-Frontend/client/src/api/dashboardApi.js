import axiosClient from "./axiosClient";

const dashboardApi = {
  getTodayHabits: (date) => {
    const params = date ? { date } : {};
    return axiosClient.get("/dashboard/today", { params });
  },
  getStats: (date) => {
    const params = date ? { date } : {};
    return axiosClient.get("/dashboard/stats", { params });
  }
};

export default dashboardApi;
