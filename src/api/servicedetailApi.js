import apiClient from "./apiClient";

const servicedetailApi = {
  // Lấy chi tiết của một dịch vụ theo serviceId
  getByServiceId: (serviceId) => apiClient.get(`/ServicesDetail/GetByService/${serviceId}`),
};

export default servicedetailApi;
