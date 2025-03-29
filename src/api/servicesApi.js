import apiClient from "./apiClient";

const servicesApi = {
  getAllServices: () =>
    apiClient.get("/api/SkincareServices/GetServices", {
      params: { page: 1, pageSize: 20 }
    }),

  getAllServices1: () =>
    apiClient.get("/api/SkincareServices/GetServices", {
      params: { page: 1, pageSize: 8 }
    }),

  getServiceById: (id) => apiClient.get(`/api/ServicesDetail/GetByService/${id}`),

  createService: (formData) =>
    apiClient.post("/api/SkincareServices/Create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  updateService: (id, formData) =>
    apiClient.put(`/api/SkincareServices/Update?id=${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteService: (id) => apiClient.delete(`/api/SkincareServices/Delete?id=${id}`),
  
  getImageById: (imageId) => apiClient.get(`/api/Image/GetImageById?imageId=${imageId}`)
};

export default servicesApi;
