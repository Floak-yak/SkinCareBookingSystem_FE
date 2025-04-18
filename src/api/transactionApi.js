import apiClient from "./apiClient";

const transactionApi = {
  // Lấy lịch sử giao dịch theo UserId (sử dụng endpoint mới)
  getByUserId: (userId) =>
    apiClient.get(`/api/Transaction/GetTransactionByUserId?userId=${userId}`),

  // Lấy tất cả giao dịch (giữ nguyên như cũ)
  getAll: () => apiClient.get("/api/Transaction/Gets"),

  // Kiểm tra trạng thái thanh toán
  checkTransaction: (orderId) => apiClient.get(`/api/Transaction/${orderId}`),

  // Hủy giao dịch
  cancel: (transactionId) =>
    apiClient.put(`/api/Transaction/Cancel?transactionId=${transactionId}`),

  // Xác nhận thanh toán giao dịch (checkout giao dịch)
  checkout: (transactionId) =>
    apiClient.put(`/api/Transaction/Checkout?transactionId=${transactionId}`),

  getByBookingId: (bookingId) =>
    apiClient.get(
      `/api/Transaction/GetTransactionByBookingId?bookingId=${bookingId}`
    ),

  // Lấy thông tin giao dịch theo transactionId
  getById: (transactionId) =>
    apiClient.get(
      `/api/Transaction/GetTransactionById?transactionId=${transactionId}`
    ),
};

export default transactionApi;
