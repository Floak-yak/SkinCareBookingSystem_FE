import apiClient from "./apiClient";

const doctorApi = {
  // Lấy danh sách tất cả bác sĩ
  getAllDoctors: () => apiClient.get("/api/User/GetSkinTherapists"),

  // Lấy thông tin chi tiết của một bác sĩ
  getDoctorById: (id) => apiClient.get(`/api/Doctor/${id}`),

  getDoctorByCategoryId: (id) => apiClient.get(`/api/User/GetSkinTherapistsByCategoryId?categoryId=${id}`),

  // Lấy tất cả ảnh
  getAllImages: () => apiClient.get("/api/Image/Gets"),
};

export default doctorApi;