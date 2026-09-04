import api from "./api";

export const fetchCart = () => api.get("/cart").then((r) => r.data);
export const addToCartApi = (productId, quantity = 1) =>
  api.post("/cart/items", { productId, quantity }).then((r) => r.data);
export const updateCartItemApi = (productId, quantity) =>
  api.put(`/cart/items/${productId}`, { quantity }).then((r) => r.data);
export const removeCartItemApi = (productId) =>
  api.delete(`/cart/items/${productId}`).then((r) => r.data);
export const clearCartApi = () => api.delete("/cart").then((r) => r.data);
export const mergeCartApi = (items) => api.post("/cart/merge", { items }).then((r) => r.data);
export const applyCouponApi = (code) => api.post("/cart/coupon", { code }).then((r) => r.data);
export const removeCouponApi = () => api.delete("/cart/coupon").then((r) => r.data);
