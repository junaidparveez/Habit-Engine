import axiosClient from "./axiosClient";

const userApi = {
  getProgress: () => axiosClient.get("/auth/progress"),
};

export default userApi;
