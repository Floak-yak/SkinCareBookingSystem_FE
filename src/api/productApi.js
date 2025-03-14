import apiClient from "./apiClient";

const productApi = {
  // Lấy danh sách sản phẩm mặc định (giá từ thấp đến cao)
  getAllProducts: () => apiClient.get("/Product/SearchAsc"),

  // Tìm kiếm sản phẩm theo tên
  searchByName: (name) =>
    apiClient.get(`/Product/IncludeName?name=${encodeURIComponent(name)}`),

  // Tìm kiếm theo khoảng giá
  searchByPriceRange: (min, max) =>
    apiClient.get(`/Product/MinMaxPrice?minPrice=${min}&maxPrice=${max}`),

  // Lấy sản phẩm theo danh mục
  searchByCategory: (categoryId) =>
    apiClient.get(`/Product/CategoryId?CategoryId=${categoryId}`),

  // Sắp xếp giá tăng dần
  getSortedByPriceAsc: () => apiClient.get("/Product/SearchAsc"),

  // Sắp xếp giá giảm dần
  getSortedByPriceDesc: () => apiClient.get("/Product/SearchDesc"),

  // Xóa sản phẩm
  removeProduct: (productId) =>
    apiClient.delete(`/Product/RemoveProduct?productId=${productId}`),

  // Thêm sản phẩm (hỗ trợ thêm nhiều sản phẩm)
  addProducts: (products) => apiClient.post("/Product/AddProduct", products),
};

export default productApi;
