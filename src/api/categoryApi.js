import apiClient from "./apiClient";

const categoryApi = {
  getAll: () => apiClient.get("/api/Category/GetCategories"),
  
  getById: (categoryId) =>
    apiClient.get(`/api/Category/GetCategoryById?categoryId=${categoryId}`),

  create: (categoryName) =>
    apiClient.post(`/api/Category/Create?categoryName=${categoryName}`),

  createWithUserId: (categoryName, userId) =>
    apiClient.post(`/api/Category/CreateUserId?categoryName=${categoryName}&userId=${userId}`),

  update: (categoryId, newCategoryName) =>
    apiClient.put(`/api/Category/UpdateCategory?categoryId=${categoryId}&newCategoryName=${newCategoryName}`),

  delete: (categoryId) => apiClient.delete(`/api/Category/${categoryId}`),
};

export default categoryApi;
