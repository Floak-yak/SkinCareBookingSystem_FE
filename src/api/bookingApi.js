import apiClient from "./apiClient";

const bookingApi = {
    // Lấy danh sách booking
    getAllBookings: () => apiClient.get("/Booking/Gets"),

    // Tạo booking mới và nhận URL thanh toán
    createBooking: (bookingData) => apiClient.post("/Booking/Create", {
        date: bookingData.date,
        time: bookingData.time,
        serviceName: bookingData.serviceName,
        userId: bookingData.userId,
        skinTherapistId: bookingData.skinTherapistId,
        categoryId: bookingData.categoryId
    }),

    // Hủy booking
    cancelBooking: (bookingId, userId) => apiClient.delete(`/Booking/Cancel?bookingId=${bookingId}&userId=${userId}`),

    // Cập nhật ngày giờ và nhân viên của booking
    updateBookingDate: (bookingData) => apiClient.put("/Booking/Update", {
        bookingId: bookingData.bookingId,
        date: bookingData.date,
        time: bookingData.time,
        skinTherapistId: bookingData.skinTherapistId
    }),
};

export default bookingApi; 