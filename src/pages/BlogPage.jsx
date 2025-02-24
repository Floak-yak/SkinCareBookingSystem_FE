import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { Input, Select, Button } from "antd";
import useAuth from "../hooks/useAuth";
import "../styles/blogPage.css";

const { Option } = Select;

const BlogPage = () => {
  // Giả sử file blogs.json được đặt tại /data/blogs.json
  const { data: blogs, loading, error } = useFetch("/data/blogs.json", "blogs");
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Dùng useNavigate để chuyển trang
  const navigate = useNavigate();

  // Lọc bài viết (đã duyệt + tiêu đề + danh mục)
  const filteredBlogs = blogs?.filter((blog) => {
    const isApproved = blog.isApproved;
    const matchesTitle = blog.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory
      ? blog.category === filterCategory
      : true;
    return isApproved && matchesTitle && matchesCategory;
  });

  if (loading) return <p>Đang tải bài viết...</p>;
  if (error) return <p>Có lỗi xảy ra khi tải bài viết.</p>;

  // Khi click card => chuyển sang chi tiết
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
            defaultValue={""}
          >
            <Option value="">Tất cả</Option>
            <Option value="Chăm sóc da">Chăm sóc da</Option>
            <Option value="Hướng dẫn skincare">Hướng dẫn skincare</Option>
            <Option value="Sản phẩm">Sản phẩm</Option>
          </Select>
          {currentUser && (
            <div className="create-blog-btn-group">
              <Button type="primary" className="create-blog-btn">
                <a href="/blogs/create" style={{ color: "#fff" }}>
                  Đăng Bài Viết
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="blog-grid">
        {filteredBlogs.map((blog) => (
          <div
            key={blog.id}
            className="blog-card"
            onClick={() => handleCardClick(blog.id)}
          >
            <img alt={blog.title} src={blog.image} className="blog-card-image" />
            <div className="blog-card-content">
              <h3>{blog.title}</h3>
              <p>
                {`Đăng bởi ${blog.author} - ${new Date(blog.date).toLocaleDateString()}`}
              </p>
              {/* Bỏ Link "Xem chi tiết" để toàn card có thể click */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;