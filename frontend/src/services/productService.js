import api from "./api";

export const fetchProducts = (params = {}) =>
  api.get("/products", { params }).then((r) => r.data);

export const fetchProductBySlug = (slug) => api.get(`/products/${slug}`).then((r) => r.data);

export const fetchRelatedProducts = (slug) =>
  api.get(`/products/${slug}/related`).then((r) => r.data);

export const fetchCategories = () => api.get("/categories").then((r) => r.data);

export const fetchCategoryBySlug = (slug) => api.get(`/categories/${slug}`).then((r) => r.data);

// ---- Admin ----
export const fetchAllProductsAdmin = () => api.get("/products/admin/all").then((r) => r.data);
export const fetchProductByIdAdmin = (id) => api.get(`/products/id/${id}`).then((r) => r.data);
export const createProductAdmin = (data) => api.post("/products", data).then((r) => r.data);
export const updateProductAdmin = (id, data) =>
  api.put(`/products/${id}`, data).then((r) => r.data);
export const deleteProductAdmin = (id) => api.delete(`/products/${id}`).then((r) => r.data);

export const fetchAllCategoriesAdmin = () =>
  api.get("/categories/admin/all").then((r) => r.data);
export const createCategoryAdmin = (data) => api.post("/categories", data).then((r) => r.data);
export const updateCategoryAdmin = (id, data) =>
  api.put(`/categories/${id}`, data).then((r) => r.data);
export const deleteCategoryAdmin = (id) => api.delete(`/categories/${id}`).then((r) => r.data);

export const uploadProductImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api
    .post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};
