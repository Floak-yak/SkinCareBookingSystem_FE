import apiClient from "./apiClient";

const imageApi = {
  // Lấy toàn bộ ảnh
  getAll: () => apiClient.get("/api/Image/Gets"),

  // Upload ảnh
  upload: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.post("/api/Image/UploadImage", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  // Lấy ảnh theo ID
  getImageById: (imageId) =>
    apiClient.get(`/api/Image/GetImageById?imageId=${imageId}`),
};

export default imageApi;

