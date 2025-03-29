import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import postApi from "../api/postApi";
import categoryApi from "../api/categoryApi";
import "../styles/createBlog.css";

const CreateBlog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    categoryId: "",
    imageLink: "",
    content: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        const fetchedCategories = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h3>Bạn cần đăng nhập mới có thể tạo bài viết!</h3>
        <button onClick={() => navigate("/login")}>Đăng nhập ngay</button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let contentHTML = formData.content.trim();
  
      // Nếu content không có thẻ HTML thì wrap lại thành <p>...
      // if (!contentHTML.startsWith("<")) {
      //   contentHTML = `<p>${contentHTML}</p>`;
      // }
  
      const postData = {
        ...formData,
        content: contentHTML,
        userId: user.userId,
      };
  
      console.log("Payload gửi đi:", postData);
  
      const response = await postApi.createPost(postData);
  
      if (response.data === "Create Success") {
        alert("Tạo bài viết thành công!");
        setFormData({
          title: "",
          summary: "",
          categoryId: "",
          imageLink: "",
          content: "",
        });
        navigate("/blogs");
      } else {
        alert("Tạo bài viết thất bại!");
      }
    } catch (error) {
      console.error("Lỗi tạo bài viết:", error);
      alert("Có lỗi xảy ra khi tạo bài viết!");
    }
  };
  

  return (
    <div className="create-blog">
      <h2>Tạo Bài Viết Mới</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tiêu đề:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tiêu đề bài viết..."
            required
          />
        </div>
        <div className="form-group">
          <label>Tóm tắt:</label>
          <input
            type="text"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            placeholder="Nhập tóm tắt nội dung bài viết..."
            required
          />
        </div>
        <div className="form-group">
          <label>Danh mục:</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Image Link:</label>
          <input
            type="text"
            name="imageLink"
            value={formData.imageLink}
            onChange={handleChange}
            placeholder="Nhập đường dẫn ảnh..."
            required
          />
        </div>
        <div className="form-group">
          <label>Nội dung:</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Nhập nội dung bài viết..."
            rows="10"
            required
          />
        </div>
        <button type="submit">Tạo Bài Viết</button>
      </form>
    </div>
  );
};

export default CreateBlog;
