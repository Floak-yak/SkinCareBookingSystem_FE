import apiClient from "./apiClient";

const serviceDetailApi = {
  // Lấy chi tiết của một dịch vụ theo serviceId
  getByServiceId: (serviceId) =>
    apiClient.get(`/ServicesDetail/GetByService/${serviceId}`),
  // Lấy toàn bộ ServiceDetail thuộc về 1 service
  getDetailsByServiceId: (serviceId) =>
    apiClient.get(`/ServicesDetail/GetByService/${serviceId}`),

  // Tạo ServiceDetail
  createDetail: (data) => apiClient.post("/ServicesDetail/Create", data),

  // Cập nhật ServiceDetail
  updateDetail: (detailId, data) =>
    apiClient.put(`/ServicesDetail/Update?id=${detailId}`, data),

  // Xóa ServiceDetail
  deleteDetail: (detailId) =>
    apiClient.delete(`/ServicesDetail/Delete?id=${detailId}`),
};

export default serviceDetailApi;
