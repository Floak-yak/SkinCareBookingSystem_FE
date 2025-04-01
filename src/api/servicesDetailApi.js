import apiClient from "./apiClient";

const servicesDetailApi = {
  /**
   * Lấy tất cả chi tiết dịch vụ
   * Endpoint: GET /api/ServicesDetail/GetAllDetails
   * @returns {Promise} - Danh sách tất cả chi tiết dịch vụ
   */
  getAllDetails: () => apiClient.get("/api/ServicesDetail/GetAllDetails"),

  /**
   * Lấy chi tiết dịch vụ theo ID
   * Endpoint: GET /api/ServicesDetail/GetDetailById/{id}
   * @param {number} id - ID của chi tiết dịch vụ
   * @returns {Promise} - Chi tiết dịch vụ theo ID
   */
  getDetailById: (id) => apiClient.get(`/api/ServicesDetail/GetDetailById/${id}`),

  /**
   * Lấy tất cả chi tiết dịch vụ theo ServiceId
   * Endpoint: GET /api/ServicesDetail/GetByService/{serviceId}
   * @param {number} serviceId - ID của dịch vụ
   * @returns {Promise} - Danh sách chi tiết dịch vụ theo ServiceId
   */
  getDetailsByServiceId: (serviceId) =>
    apiClient.get(`/api/ServicesDetail/GetByService/${serviceId}`),

  /**
   * Tạo mới chi tiết dịch vụ
   * Endpoint: POST /api/ServicesDetail/Create
   * @param {object} data - Dữ liệu chi tiết dịch vụ cần tạo
   * @returns {Promise} - Chi tiết dịch vụ vừa được tạo
   */
  createDetail: (data) => apiClient.post("/api/ServicesDetail/Create", data),

  /**
   * Cập nhật chi tiết dịch vụ
   * Endpoint: PUT /api/ServicesDetail/Update/{id}
   * @param {number} detailId - ID của chi tiết dịch vụ cần cập nhật
   * @param {object} data - Dữ liệu cập nhật
   * @returns {Promise} - Chi tiết dịch vụ vừa được cập nhật
   */
  updateDetail: (detailId, data) =>
    apiClient.put(`/api/ServicesDetail/Update/${detailId}`, data),

  /**
   * Xóa chi tiết dịch vụ
   * Endpoint: DELETE /api/ServicesDetail/Delete/{id}
   * @param {number} detailId - ID của chi tiết dịch vụ cần xóa
   * @returns {Promise} - Kết quả xóa chi tiết dịch vụ
   */
  deleteDetail: (detailId) =>
    apiClient.delete(`/api/ServicesDetail/Delete/${detailId}`),
};

export default servicesDetailApi;