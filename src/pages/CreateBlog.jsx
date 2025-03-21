import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Upload, Select, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import useAuth from "../hooks/useAuth";
import apiClient from "../api/apiClient";
import "../styles/createBlog.css";

// (Tuỳ chọn) Thư viện convert HTML -> text để làm summary gọn gàng hơn
import { convert } from "html-to-text";

const { Option } = Select;

// Map tên danh mục -> ID (theo quy ước của BE)
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
  const [content, setContent] = useState(""); // Nội dung bài viết (HTML)
  const [imageBase64, setImageBase64] = useState(null); // Ảnh đại diện

  // Ref cho ReactQuill
  const quillRef = useRef(null);

  useEffect(() => {
    if (!user) {
      message.error("Bạn cần đăng nhập để viết bài!");
      navigate("/login");
    }
  }, [user, navigate]);

  // Hàm upload ảnh đại diện (preview FE)
  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setImageBase64(reader.result);
    return false; // Ngăn upload mặc định của antd
  };

  // Custom image handler cho ReactQuill (cho phép chèn ảnh vào nội dung)
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
          quillEditor.insertEmbed(range.index, "image", base64, "user");
        };
      }
    };
  };

  // Cấu hình toolbar của ReactQuill với custom image handler
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

  // Hàm submit form -> gọi API tạo bài viết
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
      // Lấy category ID từ giá trị chọn (nếu không có, mặc định là 1)
      const catId = categoryMap[values.category] || 1;

      // Nếu người dùng không chọn ảnh, sử dụng ảnh mặc định
      const postImageLink = imageBase64 || "https://via.placeholder.com/300";

      // (Tuỳ chọn) Xử lý để lấy summary gọn gàng, không dính tag HTML
      const plainText = convert(content, { wordwrap: 130 });
      const summary = plainText.substring(0, 100);

      // Tạo body request theo cấu trúc BE mong đợi
      const body = {
        userId: user.id || user.userId,   // userId từ context
        title: values.title,
        content: content,                // Nội dung đầy đủ (HTML)
        summary: summary,                // Tóm tắt 100 ký tự (hoặc tuỳ chỉnh)
        categoryId: catId,
        imageLink: postImageLink,
      };

      // Gọi API: POST /Post/Create (hoặc /Post/CreateWithContent nếu BE yêu cầu)
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
      let errorMsg = "Lỗi khi tạo bài viết. Hãy thử lại!";

      // Lấy message từ response (nếu có)
      if (error.response?.data) {
        const serverData = error.response.data;
        if (typeof serverData === "object") {
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
