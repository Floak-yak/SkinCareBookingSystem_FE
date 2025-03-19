import apiClient from "./apiClient";

const transactionApi = {
  // Lấy lịch sử giao dịch theo UserId (sử dụng endpoint mới)
  getByUserId: (userId) => apiClient.get(`/Transaction/GetTransactionByUserId?userId=${userId}`),

  // Lấy tất cả giao dịch (giữ nguyên như cũ)
  getAll: () => apiClient.get("/Transaction/Gets"),
};

export default transactionApi;