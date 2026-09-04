import api from "./api";

export const subscribeToNewsletter = (email) =>
  api.post("/subscribers", { email }).then((r) => r.data);

// ---- Admin ----
export const fetchSubscribersAdmin = () => api.get("/subscribers").then((r) => r.data);
export const deleteSubscriberAdmin = (id) => api.delete(`/subscribers/${id}`).then((r) => r.data);
