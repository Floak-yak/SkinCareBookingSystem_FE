import apiClient from "./apiClient";

const categoryApi = {
  getAll: () => apiClient.get("/Category/GetCategories"),
  getById: (categoryId) => apiClient.get(`/Category/GetCategoryById?categoryId=${categoryId}`),
  create: (categoryName) => 
    apiClient.post(`/Category/Create?categoryName=${categoryName}`),
  update: (categoryId, newCategoryName) =>
    apiClient.put(`/Category/UpdateCategory?categoryId=${categoryId}&newCategoryName=${newCategoryName}`),
  delete: (categoryId) => apiClient.delete(`/Category/${categoryId}`),
};

export default categoryApi;
