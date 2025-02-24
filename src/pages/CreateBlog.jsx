import { useEffect, useState, useRef, useMemo } from "react";
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

  // Quill ref để truy cập editor
  const quillRef = useRef(null);

  useEffect(() => {
    if (!user) {
      message.error("Bạn cần đăng nhập để viết bài!");
      navigate("/login");
    }
  }, [user, navigate]);

  // Hàm upload ảnh đại diện (thumbnail)
  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setImageBase64(reader.result);
    return false; // Ngăn antd upload mặc định
  };

  // ====== CUSTOM IMAGE HANDLER CHO REACT QUILL ======
  const handleQuillImage = () => {
    // Tạo input file
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        // Chuyển file -> base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64 = reader.result;
          // Lấy editor quill
          const quillEditor = quillRef.current.getEditor();
          // Vị trí con trỏ
          const range = quillEditor.getSelection();
          // Chèn ảnh (base64) vào nội dung
          quillEditor.insertEmbed(range.index, "image", base64, "user");
        };
      }
    };
  };

  // Cấu hình toolbar cho React Quill, thêm handler image
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        ["bold", "italic", "underline", "strike"],
        [{ header: 1 }, { header: 2 }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"], // Nút chèn ảnh
        ["clean"]
      ],
      handlers: {
        image: handleQuillImage
      }
    }
  }), []);

  // Khi submit form => Lưu bài viết
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
        image: imageBase64 || "/images/a.png", // Ảnh đại diện
        category: values.category,
        title: values.title,
        content, // Nội dung gồm cả ảnh nhúng
        isApproved: user.Role === "Staff"
      };

      // Lưu vào mock data (updateData là hàm custom từ useFetch)
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

        {/* Nội dung bài viết => ReactQuill với custom image handler */}
        <Form.Item label="Nội dung">
          <ReactQuill
            ref={quillRef}
            value={content}
            onChange={setContent}
            modules={quillModules}
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
            <Option value="Sản phẩm">Sản phẩm skincare</Option>
            <Option value="Hướng dẫn skincare">Hướng dẫn skincare</Option>
          </Select>
        </Form.Item>

        {/* Ảnh đại diện (thumbnail) */}
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