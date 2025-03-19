import apiClient from "./apiClient";

const doctorApi = {
  // Lấy danh sách tất cả bác sĩ
  getAllDoctors: () => apiClient.get("/User/GetSkinTherapists"),

  // Lấy thông tin chi tiết của một bác sĩ
  getDoctorById: (id) => apiClient.get(`/Doctor/${id}`),

  // Lấy tất cả ảnh
  getAllImages: () => apiClient.get("/Image/Gets"),
};

export default doctorApi; 