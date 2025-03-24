import apiClient from "./apiClient";

const servicesApi = {
  // Lấy danh sách tất cả dịch vụ
  getAllServices: () =>
    apiClient.get("/SkincareServices/GetServices?page=1&pageSize=20"),

  // Lấy chi tiết dịch vụ theo ID
  getServiceById: (id) => apiClient.get(`/ServicesDetail/GetByService/${id}`),

  // Tạo dịch vụ (multipart)
  createService: (formData) =>
    apiClient.post("/SkincareServices/Create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Cập nhật dịch vụ
  updateService: (id, formData) =>
    apiClient.put(`/SkincareServices/Update?id=${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Xóa dịch vụ theo ID
  deleteService: (id) => apiClient.delete(`/SkincareServices/Delete?id=${id}`),
  // Lấy ảnh theo ID
  getImageById: (imageId) => apiClient.get(`/api/Image/GetImageById?imageId=${imageId}`)
};

export default servicesApi;
