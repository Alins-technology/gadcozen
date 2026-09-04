import api from "./api";

export const registerUser = (data) => api.post("/auth/register", data).then((r) => r.data);
export const loginUser = (data) => api.post("/auth/login", data).then((r) => r.data);
export const fetchMe = () => api.get("/auth/me").then((r) => r.data);
export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email }).then((r) => r.data);
export const resetPassword = (token, password) =>
  api.post(`/auth/reset-password/${token}`, { password }).then((r) => r.data);
