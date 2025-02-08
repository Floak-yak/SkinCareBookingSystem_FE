import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Upload, Select, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import useAuth from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";
import "../styles/createBlog.css";

const { Option } = Select;

const CreateBlog = () => {
  const { user } = useAuth();
  const { updateData } = useFetch("/data/blogs.json", "blogs");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [imageBase64, setImageBase64] = useState(null);

  useEffect(() => {
    if (!user) {
      message.error("Bạn cần đăng nhập để viết bài!");
      navigate("/login");
    }
  }, [user, navigate]);

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setImageBase64(reader.result);
    return false;
  };

  const handleSubmit = (values) => {
    if (!user) {
      message.error("Bạn cần đăng nhập để đăng bài!");
      return;
    }

    if (!content.trim()) {
      message.error("Nội dung bài viết không được để trống!");
      return;
    }

    setLoading(true);
    try {
      const newBlog = {
        id: Date.now(),
        userId: user.id,
        author: user.FullName,
        datePost: new Date().toISOString(),
        image: imageBase64 || "/default.jpg",
        category: values.category,
        title: values.title,
        content,
        isApproved: user.Role === "Staff",
      };

      // Lưu vào localStorage và cập nhật state mà không ghi đè mock data
      updateData(newBlog);

      message.success(
        user.Role === "Staff"
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

  return (
    <div className="create-blog-container">
      <h2>Viết bài mới</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input placeholder="Nhập tiêu đề bài viết..." />
        </Form.Item>

        <Form.Item label="Nội dung">
          <ReactQuill
            value={content}
            onChange={setContent}
            className="rich-text-editor"
          />
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

        <Form.Item label="Ảnh đại diện">
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
