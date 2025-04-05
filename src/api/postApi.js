import apiClient from "./apiClient";

const postApi = {
  // Lấy danh sách các bài đăng
  getPosts: () => apiClient.get("/api/Post/GetPosts"),

  // Lấy thông tin bài đăng theo ID
  getPostById: (id) => apiClient.get(`/api/Post/GetPostById?postId=${id}`),

  // Xóa bài đăng theo ID
  deletePost: (id) => apiClient.delete(`/api/Post/${id}`),

  // Cập nhật bài đăng
  updatePost: (postData) => apiClient.put("/api/Post/UpdatePost", postData),

  // Duyệt bài đăng
  approvePost: (postData) => apiClient.put("/api/Post/ApprovePost", postData),

  // Tạo mới bài đăng
  createPost: (postData) => apiClient.post("/api/Post/Create", postData),

  // Tạo mới bài đăng kèm nội dung
  createPostWithContent: (postData) => apiClient.post("/api/Post/CreateWithContent", postData),

  // Lấy danh sách bài đăng theo CategoryId
  getPostsByCategoryId: (categoryId) =>
    apiClient.get(`/api/Post/CategoryId?categoryId=${categoryId}`),

  // Lấy danh sách bài đăng có chứa name
  getPostsIncludeName: (name) => apiClient.get(`/api/Post/IncludeName?text=${name}`),
};

export default postApi;
