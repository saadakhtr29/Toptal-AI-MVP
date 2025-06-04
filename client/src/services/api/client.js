import axios from "axios";
import { auth } from "../../services/firebase";

const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
};

const apiClient = axios.create(API_CONFIG);

// Request interceptor for authentication
apiClient.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error("Error in request interceptor:", error);
    return Promise.reject(error);
  }
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Try to refresh the token
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true);

          // Retry the original request with new token
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios(error.config);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }

      // If token refresh fails or no user, redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
