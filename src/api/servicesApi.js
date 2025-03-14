import apiClient from "./apiClient";

// Hàm lấy danh sách dịch vụ
export const getServices = async () => {
  try {
    const response = await apiClient.get("/services");
    return response.data; // Trả về dữ liệu để sử dụng
  } catch (error) {
    console.error("Lỗi khi lấy danh sách dịch vụ:", error);
    throw error; // Ném lỗi để component có thể xử lý
  }
};