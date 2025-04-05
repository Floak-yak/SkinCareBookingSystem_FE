import apiClient from "./apiClient";

const postContentApi = {
  // Lấy danh sách tất cả post content
  getAll: () => apiClient.get("/api/PostContent/Get"),

  // Lấy thông tin post content theo ID
  getById: (id) => apiClient.get(`/api/PostContent/${id}`),

  // Xóa post content theo ID
  delete: (id) => apiClient.delete(`/api/PostContent/${id}`),

  // Tạo post content mới
  create: (contentData) => apiClient.post("/api/PostContent/Create", contentData),
};

export default postContentApi;
