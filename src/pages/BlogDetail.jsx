import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spin, Typography, message } from "antd";
import "../styles/blogDetail.css";

const { Title, Paragraph, Text } = Typography;

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      setLoading(true);
      try {
        // Lấy dữ liệu từ JSON (file blogs.json)
        const response = await fetch("/data/blogs.json");
        const jsonData = await response.json();

        // Lấy dữ liệu từ localStorage
        const storedBlogs = localStorage.getItem("blogs");
        const localBlogs = storedBlogs ? JSON.parse(storedBlogs) : [];

        // Gộp dữ liệu từ JSON và localStorage
        const allBlogs = [...jsonData, ...localBlogs];

        // Tìm bài viết theo ID
        const foundBlog = allBlogs.find((b) => b.id.toString() === id);

        if (foundBlog) {
          setBlog(foundBlog);
        } else {
          message.error("Bài viết không tồn tại!");
          navigate("/blogs");
        }
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!blog) {
    return <p className="error-message">Không tìm thấy bài viết!</p>;
  }

  return (
    <div className="blog-detail-container">
      <Card className="blog-card">
        <img src={blog.image || "/default.jpg"} alt={blog.title} className="blog-image" />
        <Title level={2} className="blog-title">
          {blog.title}
        </Title>
        <Text className="blog-meta">
          Đăng bởi <strong>{blog.author || "Ẩn danh"}</strong> vào ngày{" "}
          {new Date(blog.datePost).toLocaleDateString()}
        </Text>
        <Text className="blog-category">Danh mục: {blog.category}</Text>
        <Paragraph className="blog-content">{blog.content}</Paragraph>
        <Button type="primary" onClick={() => navigate("/blogs")}>
          Quay lại danh sách
        </Button>
      </Card>
    </div>
  );
};

export default BlogDetail;
