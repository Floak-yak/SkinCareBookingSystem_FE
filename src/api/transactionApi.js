import apiClient from "./apiClient";

const transactionApi = {
  // Lấy lịch sử giao dịch theo UserId (sử dụng endpoint mới)
  getByUserId: (userId) =>
    apiClient.get(`/Transaction/GetTransactionByUserId?userId=${userId}`),

  // Lấy tất cả giao dịch (giữ nguyên như cũ)
  getAll: () => apiClient.get("/Transaction/Gets"),

  // Kiểm tra trạng thái thanh toán 
  checkTransaction: (orderId) =>
    apiClient.get(`/Transaction/${orderId}`),

  // Hủy giao dịch
  cancel: (transactionId) =>
    apiClient.get(`/Transaction/Cancel?transactionId=${transactionId}`),

  // Xác nhận thanh toán giao dịch (checkout giao dịch)
  checkout: (transactionId) =>
    apiClient.get(`/Transaction/Checkout?transactionId=${transactionId}`),
};

export default transactionApi;
