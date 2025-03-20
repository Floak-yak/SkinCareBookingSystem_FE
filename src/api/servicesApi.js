import apiClient from "./apiClient";

const servicesApi = {
  // Lấy danh sách tất cả dịch vụ
  getAllServices: () => apiClient.get("/SkincareServices/GetServices?page=1&pageSize=12"),

  // Lấy chi tiết dịch vụ theo ID
  getServiceById: (id) => apiClient.get(`/ServicesDetail/GetByService/${id}`), // API chuẩn

  // Tạo dịch vụ mới
  createService: (data) => apiClient.post("/SkincareServices/Create", data),

  // Cập nhật dịch vụ theo ID
  updateService: (id, data) => apiClient.put(`/SkincareServices/Update?id=${id}`, data),

  // Xóa dịch vụ theo ID
  deleteService: (id) => apiClient.delete(`/SkincareServices/Delete?id=${id}`),

  // Lấy ảnh theo ID
  getImageById: (imageId) => apiClient.get(`/api/Image/GetImageById?imageId=${imageId}`)
};

export default servicesApi;
