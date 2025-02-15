import React, { useState } from "react";
import { Link } from "react-router-dom";
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

  const filteredBlogs = blogs?.filter((blog) => {
    const isApproved = blog.isApproved;
    const matchesTitle = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? blog.category === filterCategory : true;
    return isApproved && matchesTitle && matchesCategory;
  });

  if (loading) return <p>Đang tải bài viết...</p>;
  if (error) return <p>Có lỗi xảy ra khi tải bài viết.</p>;

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
            allowClear
            className="blog-category-select"
          >
            <Option value="Chăm sóc da">Chăm sóc da</Option>
            <Option value="Hướng dẫn skincare">Hướng dẫn skincare</Option>
            <Option value="Sản phẩm">Sản phẩm</Option>
          </Select>
          {currentUser && (
            <div className="create-blog-btn-group">
              <Link to="/blogs/create">
                <Button type="primary" className="create-blog-btn">
                  Đăng Bài Viết
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="blog-grid">
        {filteredBlogs.map((blog) => (
          <div key={blog.id} className="blog-card">
            <img alt={blog.title} src={blog.image} className="blog-card-image" />
            <div className="blog-card-content">
              <h3>{blog.title}</h3>
              <p>
                {`Đăng bởi ${blog.author} - ${new Date(blog.date).toLocaleDateString()}`}
              </p>
              <Link to={`/blogs/${blog.id}`} className="blog-read-more">
                Xem chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
