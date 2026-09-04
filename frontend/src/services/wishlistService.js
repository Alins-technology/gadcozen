import api from "./api";

export const fetchWishlist = () => api.get("/wishlist").then((r) => r.data);
export const addToWishlistApi = (productId) =>
  api.post(`/wishlist/${productId}`).then((r) => r.data);
export const removeFromWishlistApi = (productId) =>
  api.delete(`/wishlist/${productId}`).then((r) => r.data);
