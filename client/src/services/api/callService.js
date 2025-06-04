import apiClient from "./client";

export const callService = {
  startCall: (data) => apiClient.post("/api/calls/start", data),
  getCallStatus: (callId) => apiClient.get(`/api/calls/status/${callId}`),
  startBulkCalls: async (data) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found");
      }
      return await apiClient.post("/api/calls/start-bulk", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, let the component handle refresh
        throw error;
      }
      throw error;
    }
  },
  getActiveCalls: () => apiClient.get("/api/calls/active"),
  endCall: async (callId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found");
      }
      return await apiClient.post(`/api/calls/${callId}/end`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, let the component handle refresh
        throw error;
      }
      throw error;
    }
  },
  getCallHistory: (params) => apiClient.get("/api/calls/history", { params }),
};
