import apiClient from "./apiClient";

const categoryApi = {
    // Lấy danh sách categories
    getAllCategories: () => apiClient.get("/Category/GetCategories"),
};

export default categoryApi; 