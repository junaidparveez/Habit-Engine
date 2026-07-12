import axiosClient from "./axiosClient";

const statisticsApi = {
  getHeatmap: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return axiosClient.get("/statistics/heatmap", { params });
  },
  getTrends: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return axiosClient.get("/statistics/trends", { params });
  }
};

export default statisticsApi;
