import apiClient from "./apiClient";

const productApi = {
  getAll: () => apiClient.get("/Product/SearchAsc"),
  delete: (productId) =>
    apiClient.delete(`/Product/RemoveProduct?productId=${productId}`),
  create: (data) => apiClient.post("/Product/AddProduct", data),
  update: (productId, data) =>
    apiClient.put(`/Product/UpdateProduct?productId=${productId}`, data),
  searchByName: (name) =>
    apiClient.get(`/Product/IncludeName?name=${encodeURIComponent(name)}`),
  searchByPriceRange: (min, max) =>
    apiClient.get(`/Product/MinMaxPrice?minPrice=${min}&maxPrice=${max}`),
  searchByCategory: (categoryId) =>
    apiClient.get(`/Product/CategoryId?CategoryId=${categoryId}`),
  getSortedByPriceAsc: () => apiClient.get("/Product/SearchAsc"),
  getSortedByPriceDesc: () => apiClient.get("/Product/SearchDesc"),
  checkOut: (checkoutData) => apiClient.post("/Product", checkoutData),
};

export default productApi;
