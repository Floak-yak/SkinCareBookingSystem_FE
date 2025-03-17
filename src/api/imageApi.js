import apiClient from "./apiClient";

const imageApi = {
  getAll: () => apiClient.get("/Image/Gets"),
  upload: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.post("/Image/UploadImage", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default imageApi;
