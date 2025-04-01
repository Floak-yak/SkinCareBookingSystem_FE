import apiClient from "./apiClient";

const bookingApi = {
  getAllBookings: () => apiClient.get("/api/Booking/Gets"),

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
    updateBookingDate: (bookingData) => apiClient.put("/Booking/Update", {
        bookingId: bookingData.bookingId,
        date: bookingData.date,
        time: bookingData.time,
        skinTherapistId: bookingData.skinTherapistId
    }),

    CheckOut: (skinTherapistId, scheduleLogId) =>
        apiClient.get(`/Booking/SkinTherapistCheckout?skinTherapistId=${skinTherapistId}&scheduleLogId=${scheduleLogId}`),
};

export default bookingApi;