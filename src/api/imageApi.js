import apiClient from "./apiClient";

const imageApi = {
  // Lấy toàn bộ ảnh
  getAll: () => apiClient.get("/Image/Gets"),

  // Upload ảnh
  upload: (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return apiClient.post("/Image/UploadImage", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  // Lấy ảnh theo ID (mới cập nhật)
  getImageById: (imageId) =>
    apiClient.get(`/Image/GetImageById?imageId=${imageId}`),
};

export default imageApi;
