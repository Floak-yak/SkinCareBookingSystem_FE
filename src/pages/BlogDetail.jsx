import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button, Spin } from "antd";
import postApi from "../api/postApi";
import "../styles/blogDetail.css";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy chi tiết bài viết từ BE thông qua postApi
  useEffect(() => {
    postApi
      .getPostById(id)
      .then((res) => {
        setBlog(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Spin size="large" />;
  if (error) return <p>Có lỗi xảy ra: {error}</p>;
  if (!blog) return <p>Bài viết không tồn tại.</p>;

  return (
    <div className="blog-detail-container">
      {/* Tiêu đề bài viết */}
      <h1 className="blog-detail-title">{blog.title}</h1>

      {/* Tác giả và ngày đăng */}
      <div className="blog-detail-meta">
        <span className="blog-detail-author">
          Đăng bởi {blog.user?.fullName || "Ẩn danh"}
        </span>
        <span className="blog-detail-date">
          {new Date(blog.datePost).toLocaleDateString("vi-VN")}
        </span>
      </div>

      {/* Ảnh minh họa */}
      {blog.image ? (
        <img
          src={blog.image.description || "/no-image.jpg"}
          alt={blog.title}
          className="blog-detail-image"
        />
      ) : (
        <img src="/no-image.jpg" alt={blog.title} className="blog-detail-image" />
      )}

      {/* Nội dung bài viết: parse HTML */}
      <div
        className="blog-detail-content"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Nút quay lại danh sách */}
      <div className="blog-detail-back">
        <Link to="/blogs">
          <Button type="primary">Quay lại danh sách</Button>
        </Link>
      </div>
    </div>
  );
};

export default BlogDetail;
