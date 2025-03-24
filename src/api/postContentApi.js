import apiClient from "./apiClient";

const postContentApi = {
  // Lấy danh sách tất cả post content
  getAll: () => apiClient.get("/PostContent/Get"),

  // Lấy thông tin post content theo ID
  getById: (id) => apiClient.get(`/PostContent/${id}`),

  // Xóa post content theo ID
  delete: (id) => apiClient.delete(`/PostContent/${id}`),

  // Tạo post content mới
  create: (contentData) => apiClient.post("/PostContent/Create", contentData),
};

export default postContentApi;
