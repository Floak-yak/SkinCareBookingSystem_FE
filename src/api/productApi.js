import apiClient from "./apiClient";

const productApi = {
  getAll: () => apiClient.get("/api/Product/SearchAsc"),
  getById: (productId) => apiClient.get(`/api/Product/GetById?productId=${productId}`),
  delete: (productId) => apiClient.delete(`/api/Product/RemoveProduct?productId=${productId}`),
  create: (data) => apiClient.post("/api/Product/AddProduct", data),
  update: (data) => apiClient.put("/api/Product/UpdateProduct", data),
  searchByName: (name) => apiClient.get(`/api/Product/IncludeName?name=${encodeURIComponent(name)}`),
  searchByPriceRange: (min, max) => apiClient.get(`/api/Product/MinMaxPrice?minPrice=${min}&maxPrice=${max}`),
  searchByCategory: (categoryId) => apiClient.get(`/api/Product/CategoryId?CategoryId=${categoryId}`),
  getSortedByPriceAsc: () => apiClient.get("/api/Product/SearchAsc"),
  getSortedByPriceDesc: () => apiClient.get("/api/Product/SearchDesc"),
  checkOut: (checkoutData) => apiClient.post("/api/Product/CheckoutCart", checkoutData),
};

export default productApi;
