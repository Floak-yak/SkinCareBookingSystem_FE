import apiClient from "./apiClient";

const servicesApi = {
  getAllServices: (page = 1, pageSize = 20) =>
    apiClient.get("/api/SkincareServices/GetServices", {
      params: { page, pageSize }
    }),

  getAllServices1: (page = 1, pageSize = 8) =>
    apiClient.get("/api/SkincareServices/GetServices", {
      params: { page, pageSize}
    }),

  getServiceById: (id) => apiClient.get(`/api/SkincareServices/GetServiceById`, {
    params: { id }
  }),

  getServiceByName: (name) => apiClient.get(`/api/SkincareServices/GetServiceByName`, {
    params: { name }
  }),

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
