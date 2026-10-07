import api from "./api";

export const submitBulkEnquiry = (data) => api.post("/bulk-enquiries", data).then((r) => r.data);

// ---- Admin ----
export const fetchBulkEnquiriesAdmin = () => api.get("/bulk-enquiries").then((r) => r.data);
export const updateBulkEnquiryAdmin = (id, data) =>
  api.put(`/bulk-enquiries/${id}`, data).then((r) => r.data);
