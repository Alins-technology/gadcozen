import api from "./api";

export const updateProfile = (data) => api.put("/users/profile", data).then((r) => r.data);
export const changePassword = (data) => api.put("/users/change-password", data).then((r) => r.data);
export const fetchAddresses = () => api.get("/users/addresses").then((r) => r.data);
export const addAddress = (data) => api.post("/users/addresses", data).then((r) => r.data);
export const updateAddress = (id, data) =>
  api.put(`/users/addresses/${id}`, data).then((r) => r.data);
export const deleteAddress = (id) => api.delete(`/users/addresses/${id}`).then((r) => r.data);

// ---- Admin ----
export const fetchUsersAdmin = (params = {}) => api.get("/users", { params }).then((r) => r.data);
export const fetchUserByIdAdmin = (id) => api.get(`/users/${id}`).then((r) => r.data);
export const updateUserRoleAdmin = (id, role) =>
  api.put(`/users/${id}/role`, { role }).then((r) => r.data);
export const toggleUserStatusAdmin = (id, isActive) =>
  api.put(`/users/${id}/status`, { isActive }).then((r) => r.data);
export const fetchDashboardStats = () => api.get("/admin/dashboard").then((r) => r.data);
