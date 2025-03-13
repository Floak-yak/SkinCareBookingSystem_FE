import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input, Select, Button } from "antd";
import useAuth from "../hooks/useAuth";
import apiClient from "../api/apiClient";
import "../styles/blogPage.css";

const { Option } = Select;

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const navigate = useNavigate();

  // 🟢 Gọi API ngay tại component
  useEffect(() => {
    let isMounted = true;

    apiClient
      .get("/Post/GetPosts") // Gọi API GET /api/Post/GetPosts
      .then((res) => {
        if (isMounted) {
          setPosts(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 🟡 Lọc bài viết
  const filteredPosts = posts?.filter((post) => {
    // Giả sử postStatus = 1 => Approved
    const isApproved = post.postStatus === 1;
    const matchesTitle = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    // Giả sử category có thuộc tính name
    const matchesCategory = filterCategory
      ? post.category?.name === filterCategory
      : true;
    return isApproved && matchesTitle && matchesCategory;
  });

  if (loading) return <p>Đang tải bài viết...</p>;
  if (error) return <p>Có lỗi xảy ra khi tải bài viết: {error}</p>;

  const handleCardClick = (id) => {
    navigate(`/blogs/${id}`);
  };

  return (
    <div className="blog-page">
      <h2>Danh sách bài viết</h2>

      <div className="blog-filters">
        <div className="filters-group">
          <Input
            placeholder="Tìm kiếm bài viết"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="blog-search-input"
          />
          <Select
            placeholder="Chọn danh mục"
            onChange={(value) => setFilterCategory(value)}
            className="blog-category-select"
            defaultValue=""
          >
            <Option value="">Tất cả</Option>
            <Option value="Chăm sóc da">Chăm sóc da</Option>
            <Option value="Hướng dẫn skincare">Hướng dẫn skincare</Option>
            <Option value="Sản phẩm">Sản phẩm</Option>
          </Select>
          {currentUser && (
            <div className="create-blog-btn-group">
              <Button type="primary" className="create-blog-btn">
                <Link to="/blogs/create" style={{ color: "#fff" }}>
                  Đăng Bài Viết
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="blog-grid">
        {filteredPosts.map((post) => {
          // Lấy link ảnh
          const imageUrl = post.image?.description || "/no-image.jpg";
          // Tên tác giả
          const authorName = post.user?.fullName || "Ẩn danh";
          // Ngày đăng
          const date = new Date(post.datePost).toLocaleDateString("vi-VN");

          return (
            <div
              key={post.id}
              className="blog-card"
              onClick={() => handleCardClick(post.id)}
            >
              <img alt={post.title} src={imageUrl} className="blog-card-image" />
              <div className="blog-card-content">
                <h3>{post.title}</h3>
                <p>{`Đăng bởi ${authorName} - ${date}`}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlogPage;
