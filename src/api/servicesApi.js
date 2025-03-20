import apiClient from "./apiClient";

const servicesApi = {
    // Lấy danh sách tất cả dịch vụ
    getAllServices: () => apiClient.get("/SkincareServices/GetServices?page=1&pageSize=12"),

    getAllServices1: () => apiClient.get("/SkincareServices/GetServices?page=1&pageSize=8"),

    // Lấy thông tin chi tiết của một dịch vụ
    getServiceById: (id) => apiClient.get(`/Service/${id}`),
};

export default servicesApi;