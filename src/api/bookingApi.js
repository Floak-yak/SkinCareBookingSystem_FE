import apiClient from "./apiClient";

const bookingApi = {
  getAllBookings: () => apiClient.get("/api/Booking/Gets"),

  getPayBackCancelBookings: () => apiClient.get("/api/Booking/GetPayBackCancelBookings"),

  getPaidCancelBookings: () => apiClient.get("/api/Booking/GetPaidCancelBookings"),

  getPayBackCancelBookingsByUserId: (userId) => apiClient.get(`/api/Booking/GetPayBackCancelBookingByUserId?userId=${userId}`),

  upload: (bookingId, file) => {
    const formData = new FormData();
    formData.append("BookingId", bookingId);
    formData.append("Image", file); // Sử dụng originalFileObj để lấy file gốc từ Ant Design Upload
    console.log("Form data:", formData);
    console.log("Form data:", formData.get("Image"));
    console.log("Form data bookingId:", formData.get("BookingId"));
    return apiClient.post("/api/Booking/UploadImage", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Giữ lại nếu API yêu cầu token
        "Content-Type": "multipart/form-data", // Ensure proper content type
      },
    });
  },

  completePayment: (bookingId) => apiClient.put(`/api/Booking/CompletePayment?bookingId=${bookingId}`),

  createBooking: (bookingData) => apiClient.post("/api/Booking/Create", {
    date: bookingData.date,
    time: bookingData.time,
    serviceName: bookingData.serviceName,
    userId: bookingData.userId,
    skinTherapistId: bookingData.skinTherapistId,
    categoryId: bookingData.categoryId
  }),

  cancelBooking: (bookingId, userId) =>
    apiClient.delete(`/api/Booking/Cancel?bookingId=${bookingId}&userId=${userId}`),

  // Cập nhật ngày giờ và nhân viên của booking
  updateBookingDate: (bookingData) => apiClient.put("api/Booking/Update", {
    bookingId: bookingData.bookingId,
    date: bookingData.date,
    time: bookingData.time,
    skinTherapistId: bookingData.skinTherapistId
  }),
    CheckOut: (skinTherapistId, scheduleLogId) =>
        apiClient.get(`/api/Booking/SkinTherapistCheckout?skinTherapistId=${skinTherapistId}&scheduleLogId=${scheduleLogId}`),
    checkIn: (customerId) =>
      apiClient.put(`/api/Booking/SkinTherapistCheckin?userId=${customerId}`),
};

export default bookingApi;