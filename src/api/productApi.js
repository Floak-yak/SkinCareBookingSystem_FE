import apiClient from "./apiClient";

const productApi = {
  getAll: () => apiClient.get("/Product/SearchAsc"),
  getById: (productId) => apiClient.get(`/Product/GetById?productId=${productId}`),
  delete: (productId) =>
    apiClient.delete(`/Product/RemoveProduct?productId=${productId}`),
  create: (data) => apiClient.post("/Product/AddProduct", data),
  update: (data) => apiClient.put("/Product/UpdateProduct", data),
  searchByName: (name) =>
    apiClient.get(`/Product/IncludeName?name=${encodeURIComponent(name)}`),
  searchByPriceRange: (min, max) =>
    apiClient.get(`/Product/MinMaxPrice?minPrice=${min}&maxPrice=${max}`),
  searchByCategory: (categoryId) =>
    apiClient.get(`/Product/CategoryId?CategoryId=${categoryId}`),
  getSortedByPriceAsc: () => apiClient.get("/Product/SearchAsc"),
  getSortedByPriceDesc: () => apiClient.get("/Product/SearchDesc"),
  checkOut: (checkoutData) => apiClient.post("/Product/CheckoutCart", checkoutData),
};

export default productApi;
