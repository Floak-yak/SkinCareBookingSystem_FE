import apiClient from "./apiClient";

const postApi = {
  // Lấy danh sách các bài đăng
  getPosts: () => apiClient.get("/Post/GetPosts"),

  // Lấy thông tin bài đăng theo ID
  getPostById: (id) => apiClient.get(`/Post/GetPostById?id=${id}`),

  // Xóa bài đăng theo ID
  deletePost: (id) => apiClient.delete(`/Post/${id}`),

  // Cập nhật bài đăng
  updatePost: (postData) => apiClient.put("/Post/UpdatePost", postData),

  // Duyệt bài đăng
  approvePost: (postData) => apiClient.put("/Post/ApprovePost", postData),

  // Tạo mới bài đăng
  createPost: (postData) => apiClient.post("/Post/Create", postData),

  // Tạo mới bài đăng kèm nội dung
  createPostWithContent: (postData) => apiClient.post("/Post/CreateWithContent", postData),

  // Lấy danh sách bài đăng theo CategoryId
  getPostsByCategoryId: (categoryId) =>
    apiClient.get(`/Post/CategoryId?categoryId=${categoryId}`),

  // Lấy danh sách bài đăng có chứa name
  getPostsIncludeName: (name) => apiClient.get(`/Post/IncludeName?name=${name}`),
};

export default postApi;
