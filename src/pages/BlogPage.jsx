import { useEffect, useState, useContext } from "react";
import { Card, Row, Col, Button, List, message } from "antd";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../styles/blogPage.css";

const BlogPage = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/data/blogs.json");
        const jsonData = await response.json();

        const storedBlogs = JSON.parse(localStorage.getItem("blogs")) || [];
        const allBlogs = [...jsonData, ...storedBlogs];

        const approvedBlogs = allBlogs.filter((blog) => blog.isApproved);
        setBlogs(approvedBlogs);

        const uniqueCategories = [
          ...new Set(approvedBlogs.map((b) => b.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        message.error("Không thể tải dữ liệu!");
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = selectedCategory
    ? blogs.filter((blog) => blog.category === selectedCategory)
    : blogs;

  return (
    <div className="blog-container">
      <h1>Blog Skincare</h1>

      {/* Nút đăng bài viết */}
      {currentUser && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Link to="/blogs/create">
            <Button type="primary" className="create-blog-btn">
              Đăng Bài Viết
            </Button>
          </Link>
          <span style={{ marginLeft: "10px", fontSize: "14px", color: "#555" }}>
            {currentUser.Role === "Staff"
              ? "(Bài đăng sẽ được hiển thị ngay)"
              : "(Bài đăng sẽ cần được duyệt)"}
          </span>
        </div>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <div className="category-sidebar">
            <h3>Danh mục</h3>
            <List
              bordered
              dataSource={["Tất cả", ...categories.filter(Boolean)]}
              renderItem={(item) => (
                <List.Item
                  key={item || "unknown"}
                  className={selectedCategory === item ? "selected" : ""}
                  onClick={() =>
                    setSelectedCategory(item === "Tất cả" ? null : item)
                  }
                >
                  {item || "Không xác định"}
                </List.Item>
              )}
            />
          </div>
        </Col>
        <Col xs={24} md={18}>
          <Row gutter={[16, 16]}>
            {filteredBlogs?.map((blog, index) => (
              <Col key={blog?.id || index} xs={24} sm={12} md={8}>
                <Card className="blog-card" hoverable>
                  <img
                    src={blog?.image || "/default.jpg"}
                    alt={blog?.title}
                    className="blog-image"
                  />
                  <h3>{blog?.title || "Không có tiêu đề"}</h3>
                  <p>{blog?.category || "Không có mô tả"}</p>
                  <Link to={`/blogs/${blog?.id || "#"}`} className="btn-view">
                    Xem chi tiết
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default BlogPage;
