import api from "./api";

export const fetchProductReviews = (productId) =>
  api.get(`/reviews/product/${productId}`).then((r) => r.data);
export const submitReview = (productId, data) =>
  api.post(`/reviews/product/${productId}`, data).then((r) => r.data);

// ---- Admin ----
export const fetchAllReviewsAdmin = () => api.get("/reviews").then((r) => r.data);
export const moderateReviewAdmin = (id, isApproved) =>
  api.put(`/reviews/${id}/moderate`, { isApproved }).then((r) => r.data);
export const deleteReviewAdmin = (id) => api.delete(`/reviews/${id}`).then((r) => r.data);
