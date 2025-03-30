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

  updateBookingDate: (bookingData) => apiClient.put("/api/Booking/Update", {
    bookingId: bookingData.bookingId,
    date: bookingData.date,
    time: bookingData.time,
    skinTherapistId: bookingData.skinTherapistId
  }),
};

export default bookingApi;