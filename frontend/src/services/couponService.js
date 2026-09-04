import api from "./api";

// ---- Admin ----
export const fetchCouponsAdmin = () => api.get("/coupons").then((r) => r.data);
export const createCouponAdmin = (data) => api.post("/coupons", data).then((r) => r.data);
export const updateCouponAdmin = (id, data) => api.put(`/coupons/${id}`, data).then((r) => r.data);
export const deleteCouponAdmin = (id) => api.delete(`/coupons/${id}`).then((r) => r.data);
