import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gz_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid/expired - clear it so the UI falls back to guest state
      localStorage.removeItem("gz_token");
      localStorage.removeItem("gz_user");
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.errors?.[0]?.message ||
  "Something went wrong. Please try again.";

export default api;
