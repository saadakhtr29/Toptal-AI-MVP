import apiClient from "./client";

export const callService = {
  startCall: (data) => apiClient.post("/api/calls/start", data),
  getCallStatus: (callId) => apiClient.get(`/api/calls/status/${callId}`),
  startBulkCalls: (data) => apiClient.post("/api/calls/start-bulk", data),
  getActiveCalls: () => apiClient.get("/api/calls/active"),
  endCall: (callId) => apiClient.post(`/api/calls/${callId}/end`),
  getCallHistory: (params) => apiClient.get("/api/calls/history", { params }),
};
