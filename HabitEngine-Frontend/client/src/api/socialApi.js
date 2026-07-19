import axiosClient from "./axiosClient";

const socialApi = {
  // --- Friends ---
  getFriends: () => axiosClient.get("/connections/friends"),
  sendFriendRequest: (receiverId) =>
    axiosClient.post(`/connections/request/${receiverId}`),
  acceptFriendRequest: (connectionId) =>
    axiosClient.post(`/connections/respond/${connectionId}?accept=true`),

  // --- Groups ---
  getGroups: () => axiosClient.get("/groups"),
  createGroup: (data) => axiosClient.post("/groups", data),
  getGroupLeaderboard: (groupId) =>
    axiosClient.get(`/groups/${groupId}/leaderboard`),
  inviteToGroup: (groupId, userId) =>
    axiosClient.post(`/groups/${groupId}/invite/${userId}`),
  acceptGroupInvite: (groupId) =>
    axiosClient.post(`/groups/${groupId}/respond?accept=true`),
  leaveGroup: (groupId) => axiosClient.post(`/groups/${groupId}/leave`),
  removeGroupMember: (groupId, userId) =>
    axiosClient.delete(`/groups/${groupId}/members/${userId}`),
  deleteGroup: (groupId) => axiosClient.delete(`/groups/${groupId}`),

  // --- Chat ---
  getChatHistory: (groupId, receiverId) => {
    if (groupId) {
      return axiosClient.get(`/chat/group/${groupId}`);
    } else if (receiverId) {
      return axiosClient.get(`/chat/private/${receiverId}`);
    }
    return Promise.reject("Must provide groupId or receiverId");
  },
  clearPrivateChat: (receiverId) => axiosClient.delete(`/chat/private/${receiverId}`),
};

export default socialApi;
