import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Upload, Select, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import AuthContext from "../context/AuthContext";
import "../styles/createBlog.css";

const { TextArea } = Input;
const { Option } = Select;

const CreateBlog = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      message.error("Bạn cần đăng nhập để viết bài!");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Xử lý tải ảnh lên
  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setImageBase64(reader.result);
    return false;
  };

  const handleSubmit = async (values) => {
    if (!currentUser) {
      message.error("Bạn cần đăng nhập để đăng bài!");
      return;
    }

    setLoading(true);
    try {
      const newBlog = {
        id: Date.now(),
        userId: currentUser.id,
        author: currentUser.FullName,
        datePost: new Date().toISOString(),
        image: imageBase64 || "/default.jpg",
        isApproved: currentUser.Role === "Staff",
        ...values,
      };

      // Lưu vào localStorage
      const storedBlogs = JSON.parse(localStorage.getItem("blogs")) || [];
      storedBlogs.push(newBlog);
      localStorage.setItem("blogs", JSON.stringify(storedBlogs));

      message.success(
        currentUser.Role === "Staff"
          ? "Bài viết đã được đăng thành công!"
          : "Bài viết đã lưu, chờ duyệt!"
      );

      navigate("/blogs");
    } catch (error) {
      message.error("Lỗi khi lưu bài viết!");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="create-blog-container">
      <h2>Đăng bài viết mới</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input placeholder="Nhập tiêu đề bài viết..." />
        </Form.Item>

        <Form.Item
          label="Nội dung"
          name="content"
          rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
        >
          <TextArea rows={4} placeholder="Viết nội dung bài viết..." />
        </Form.Item>

        <Form.Item
          label="Danh mục"
          name="category"
          rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
        >
          <Select placeholder="Chọn danh mục">
            <Option value="Chăm sóc da">Chăm sóc da</Option>
            <Option value="Sản phẩm skincare">Sản phẩm skincare</Option>
            <Option value="Hướng dẫn skincare">Hướng dẫn skincare</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Ảnh đại diện" name="image">
          <Upload
            showUploadList={false}
            beforeUpload={handleImageUpload}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
          </Upload>
          {imageBase64 && (
            <img src={imageBase64} alt="Preview" className="preview-image" />
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Đăng bài
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateBlog;
