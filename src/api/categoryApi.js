import apiClient from "./apiClient";

const categoryApi = {
  // Lấy danh sách categories
  getAll: () => apiClient.get("/Category/GetCategories"),

  // Lấy category theo ID
  getById: (categoryId) =>
    apiClient.get(`/Category/GetCategoryById?categoryId=${categoryId}`),

  // Tạo category (chỉ có tên)
  create: (categoryName) =>
    apiClient.post(`/Category/Create?categoryName=${categoryName}`),

  // Tạo category kèm userId
  createWithUserId: (categoryName, userId) =>
    apiClient.post(
      `/Category/CreateUserId?categoryName=${categoryName}&userId=${userId}`
    ),

  // Cập nhật category
  update: (categoryId, newCategoryName) =>
    apiClient.put(
      `/Category/UpdateCategory?categoryId=${categoryId}&newCategoryName=${newCategoryName}`
    ),

  // Xóa category
  delete: (categoryId) => apiClient.delete(`/Category/${categoryId}`),
};

export default categoryApi;
