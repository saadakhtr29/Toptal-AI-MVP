import apiClient from "./client";

export const voiceAgentService = {
  startSession: (data) => apiClient.post("/api/voice-agent/start", data),
  endSession: (sessionId) =>
    apiClient.post(`/api/voice-agent/${sessionId}/end`),
  getSessionStatus: (sessionId) =>
    apiClient.get(`/api/voice-agent/${sessionId}/status`),
  sendMessage: (sessionId, message) =>
    apiClient.post(`/api/voice-agent/${sessionId}/message`, { message }),
  getSessionHistory: (sessionId) =>
    apiClient.get(`/api/voice-agent/${sessionId}/history`),
};
