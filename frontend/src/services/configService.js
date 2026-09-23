import api from "./api";

export const fetchStoreConfig = () => api.get("/config").then((r) => r.data);
