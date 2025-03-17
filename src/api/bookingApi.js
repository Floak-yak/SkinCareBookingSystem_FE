import apiClient from "./apiClient";

const bookingApi = {
  bookService: (serviceId) => apiClient.post(`/Booking/BookService`, { serviceId }),
};

export default bookingApi;
