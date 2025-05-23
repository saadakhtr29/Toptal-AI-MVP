const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

export default API_CONFIG;
