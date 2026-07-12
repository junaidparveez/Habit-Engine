import axiosClient from "./axiosClient";

const profileApi = {
  updateProfile: (data) => axiosClient.put("/auth/profile", data),
};

export default profileApi;
