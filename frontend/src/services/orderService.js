import api from "./api";

export const createOrder = (data) => api.post("/orders", data).then((r) => r.data);
export const fetchMyOrders = () => api.get("/orders/mine").then((r) => r.data);
export const fetchMyOrderByNumber = (orderNumber) =>
  api.get(`/orders/mine/${orderNumber}`).then((r) => r.data);

// ---- Admin ----
export const fetchAllOrdersAdmin = (params = {}) =>
  api.get("/orders", { params }).then((r) => r.data);
export const fetchOrderByIdAdmin = (id) => api.get(`/orders/${id}`).then((r) => r.data);
export const updateOrderStatusAdmin = (id, orderStatus) =>
  api.put(`/orders/${id}/status`, { orderStatus }).then((r) => r.data);
