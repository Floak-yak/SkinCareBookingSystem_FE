import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { Button } from 'antd';
import '../styles/blogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const { data: blogs, loading, error } = useFetch('/data/blogs.json', 'blogs');

  if (loading) return <p>Đang tải bài viết...</p>;
  // if (error) return <p>Có lỗi xảy ra khi tải bài viết.</p>;

  const blog = blogs.find(b => b.id === Number(id));
  if (!blog) return <p>Bài viết không tồn tại.</p>;

  return (
    <div className="blog-detail-container">
      {/* Tiêu đề */}
      <h1 className="blog-detail-title">{blog.title}</h1>

      {/* Tác giả, ngày đăng */}
      <div className="blog-detail-meta">
        <span className="blog-detail-author">Đăng bởi {blog.author}</span>
        <span className="blog-detail-date">
          {new Date(blog.date).toLocaleDateString()}
        </span>
      </div>

      {/* Ảnh minh hoạ (thumbnail) */}
      {blog.image && (
        <img
          src={blog.image}
          alt={blog.title}
          className="blog-detail-image"
        />
      )}

      {/* Nội dung bài viết: parse HTML thay vì text */}
      <div
        className="blog-detail-content"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Nút quay lại */}
      <div className="blog-detail-back">
        <Link to="/blogs">
          <Button type="primary">Quay lại danh sách</Button>
        </Link>
      </div>
    </div>
  );
};

export default BlogDetail;