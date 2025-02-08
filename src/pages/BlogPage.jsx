import { useState } from "react";
import { Card, Row, Col, Button, List } from "antd";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";
import "../styles/blogPage.css";

const BlogPage = () => {
  const { user: currentUser } = useAuth();
  const { data: blogs, loading } = useFetch("/data/blogs.json", "blogs");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const approvedBlogs = blogs.filter((blog) => blog.isApproved);
  const categories = [...new Set(approvedBlogs.map((b) => b.category))];

  const filteredBlogs = selectedCategory ? approvedBlogs.filter((blog) => blog.category === selectedCategory) : approvedBlogs;

  return (
    <div className="blog-container">
      <h1>Blog Skincare</h1>

      {/* 🔹 Nút đăng bài viết */}
      {currentUser && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Link to="/blogs/create">
            <Button type="primary" className="create-blog-btn">Đăng Bài Viết</Button>
          </Link>
        </div>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <div className="category-sidebar">
            <h3>Danh mục</h3>
            <List
              bordered
              dataSource={["Tất cả", ...categories]}
              renderItem={(item) => (
                <List.Item
                  key={item}
                  className={selectedCategory === item ? "selected" : ""}
                  onClick={() => setSelectedCategory(item === "Tất cả" ? null : item)}
                >
                  {item}
                </List.Item>
              )}
            />
          </div>
        </Col>
        <Col xs={24} md={18}>
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredBlogs.map((blog) => (
                <Col key={blog.id} xs={24} sm={12} md={8}>
                  <Card className="blog-card" hoverable>
                    <img src={blog.image || "/public/images/a.png"} alt={blog.title} className="blog-image" />
                    <h3>{blog.title}</h3>
                    <p>{blog.category}</p>
                    <Link to={`/blogs/${blog.id}`} className="btn-view">Xem chi tiết</Link>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default BlogPage;
