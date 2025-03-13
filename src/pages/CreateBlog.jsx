import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Upload, Select, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import useAuth from "../hooks/useAuth";
import apiClient from "../api/apiClient";
import "../styles/createBlog.css";

const { Option } = Select;

// Map tên danh mục -> ID
const categoryMap = {
  "Chăm sóc da": 1,
  "Sản phẩm skincare": 2,
  "Hướng dẫn skincare": 3,
};

const CreateBlog = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(""); // Nội dung bài viết
  const [imageBase64, setImageBase64] = useState(null); // Ảnh đại diện

  // Quill ref
  const quillRef = useRef(null);

  useEffect(() => {
    // Nếu chưa đăng nhập, chuyển về /login
    if (!user) {
      message.error("Bạn cần đăng nhập để viết bài!");
      navigate("/login");
    }
  }, [user, navigate]);

  // Upload ảnh đại diện (preview tại FE)
  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setImageBase64(reader.result);
    return false; // Ngăn upload mặc định của antd
  };

  // Custom image handler cho Quill
  const handleQuillImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64 = reader.result;
          const quillEditor = quillRef.current.getEditor();
          const range = quillEditor.getSelection();
          // Chèn ảnh base64 vào nội dung Quill
          quillEditor.insertEmbed(range.index, "image", base64, "user");
        };
      }
    };
  };

  // Cấu hình toolbar của Quill
  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          ["bold", "italic", "underline", "strike"],
          [{ header: 1 }, { header: 2 }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: handleQuillImage,
        },
      },
    }),
    []
  );

  // Xử lý submit form => Gọi API /Post/Create
  const handleSubmit = async (values) => {
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
      // Map tên danh mục -> ID
      const catId = categoryMap[values.category] || 1;

      // Ảnh đại diện: nếu user không chọn => gửi chuỗi rỗng
      // Còn nếu user đã chọn => gửi chính base64
      const postImageLink = imageBase64 || "";

      // Tạo body request theo cấu trúc BE (CreatePostWithContentsRequest)
      const body = {
        userId: user.id,
        title: values.title,
        contents: [
          {
            contentOfPost: content,   // toàn bộ HTML Quill
            contentType: 0,          // 0 = text, tuỳ backend
            position: 1,
            // Nếu bạn muốn gắn thêm ảnh cho content
            // imageLink: imageBase64 || "",
            // tạm để trống cho content, tuỳ ý:
            imageLink: "",
            postId: 0,
          },
        ],
        categoryId: catId,
        imageLink: postImageLink, // ảnh đại diện cho Post
      };

      // Gọi API => /Post/Create (qua apiClient)
      const res = await apiClient.post("/Post/Create", body);
      console.log("Create post response:", res.data);

      message.success(
        user.role === "Staff"
          ? "Bài viết đã được đăng (và được duyệt ngay)!"
          : "Bài viết đã lưu, chờ duyệt!"
      );
      navigate("/blogs");
    } catch (error) {
      console.error("Lỗi khi gọi API tạo bài:", error);
      if (error.response) {
        console.log("HTTP Status:", error.response.status);
        console.log("Response Headers:", error.response.headers);
        console.log("Response Data:", error.response.data);
      }

      let errorMsg = "Lỗi khi tạo bài viết. Hãy thử lại!";
      if (error.response?.data) {
        const serverData = error.response.data;
        if (typeof serverData === "object") {
          // Tìm 1 trường message cụ thể hay title trả về từ server
          errorMsg = serverData.title || JSON.stringify(serverData);
        } else {
          errorMsg = serverData;
        }
      }
      message.error(errorMsg);
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
            <Option value="Sản phẩm skincare">Sản phẩm skincare</Option>
            <Option value="Hướng dẫn skincare">Hướng dẫn skincare</Option>
          </Select>
        </Form.Item>

        {/* Ảnh đại diện */}
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
