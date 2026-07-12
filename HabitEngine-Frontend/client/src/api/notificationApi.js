import axiosClient from "./axiosClient";

const notificationApi = {
  getPreferences: () => axiosClient.get("/notifications/preferences"),
  updatePreferences: (data) => axiosClient.put("/notifications/preferences", data),
};

export default notificationApi;
