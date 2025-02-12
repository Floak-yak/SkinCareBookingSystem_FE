import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spin, Typography, message } from "antd";
import useFetch from "../hooks/useFetch";
import "../styles/blogDetail.css";

const { Title, Paragraph, Text } = Typography;

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: blogs, loading } = useFetch("/data/blogs.json", "blogs");

  const blog = blogs.find((b) => b.id.toString() === id);

  if (loading) {
    return <Spin size="large" className="loading-container" />;
  }

  if (!blog) {
    message.error("Bài viết không tồn tại!");
    navigate("/blogs");
    return null;
  }

  return (
    <div className="blog-detail-container">
      <Card className="blog-card">
        <img src={blog.image || "/default.jpg"} alt={blog.title} className="blog-image" />
        <Title level={2} className="blog-title">{blog.title}</Title>
        <Text className="blog-meta">
          Đăng bởi <strong>{blog.author || "Ẩn danh"}</strong> vào ngày {new Date(blog.datePost).toLocaleDateString()}
        </Text>
        <Text className="blog-category">Danh mục: {blog.category}</Text>
        <Paragraph className="blog-content">{blog.content}</Paragraph>
        <Button
          type="primary"
          onClick={() => navigate("/blogs")}
          style={{ background: "#f4a261", borderColor: "#f4a261" }}
          onMouseEnter={(e) => (e.target.style.background = "#d35400")}
          onMouseLeave={(e) => (e.target.style.background = "#f4a261")}
>
  Quay lại danh sách
</Button>

      </Card>
    </div>
  );
};

export default BlogDetail;
