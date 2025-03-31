import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input, Select, Button } from "antd";
import useAuth from "../hooks/useAuth";
import postApi from "../api/postApi";
import categoryApi from "../api/categoryApi";
import "../styles/blogPage.css";

const { Option } = Select;

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const navigate = useNavigate();

  // Lấy danh sách bài viết từ postApi
  useEffect(() => {
    let isMounted = true;
    postApi
      .getPosts()
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

  // Lấy danh mục từ API để hiển thị dropdown filter
  useEffect(() => {
    let isMounted = true;
    categoryApi
      .getAll()
      .then((res) => {
        if (isMounted) {
          // Cấu trúc trả về của API: { success: true, data: [...] }
          const fetchedCategories = Array.isArray(res.data.data)
            ? res.data.data
            : [];
          setCategories(fetchedCategories);
        }
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Lọc bài viết theo tiêu đề, danh mục và trạng thái duyệt
  const filteredPosts = posts?.filter((post) => {
    // Kiểm tra bài viết đã duyệt
    const isApproved = post.postStatus === 1;
    const matchesTitle = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory
      ? Number(post.category?.id) === Number(filterCategory)
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
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.categoryName}
              </Option>
            ))}
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
          // Nếu có post.image.description thì dùng, nếu không thử post.imageLink, còn lại dùng fallback
          const imageUrl =
            (post.image && post.image.description) ||
            post.imageLink ||
            process.env.PUBLIC_URL + "/no-image.jpg";
          const authorName = post.user?.fullName || "Ẩn danh";
          const date = new Date(post.datePost).toLocaleDateString("vi-VN");
          return (
            <div
              key={post.id}
              className="blog-card"
              onClick={() => handleCardClick(post.id)}
            >
              <img
                alt={post.title}
                src={imageUrl}
                className="blog-card-image"
              />
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
