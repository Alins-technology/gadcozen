import api from "./api";

export const submitContactForm = (data) => api.post("/contact", data).then((r) => r.data);

// ---- Admin ----
export const fetchContactSubmissionsAdmin = () => api.get("/contact").then((r) => r.data);
export const resolveContactSubmissionAdmin = (id, isResolved) =>
  api.put(`/contact/${id}/resolve`, { isResolved }).then((r) => r.data);
