import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, DatePicker, message } from "antd";
import "../styles/registerPage.css";
import apiClient from "../api/apiClient";

const RegisterPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    setLoading(true);

    // 🛠 Debug: Kiểm tra dữ liệu trước khi gửi
    console.log("📤 Dữ liệu gửi lên:", values);

    try {
      const response = await apiClient.post("/User/Register", {
        fullName: values.fullName,
        yearOfBirth: values.dob ? values.dob.format("YYYY-MM-DD") : null, // 🟢 Fix: Đổi sang format YYYY-MM-DD
        email: values.email,
        password: values.password,
        phoneNumber: values.phone,
      });

      console.log("✅ Phản hồi API:", response.data);
      message.success("Đăng ký thành công!");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      console.error("❌ Lỗi API:", error.response?.data);
      message.error(error.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Đăng Ký</h2>
        <Form form={form} layout="vertical" onFinish={handleRegister}>
          <Form.Item
            label="Họ và Tên"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input placeholder="Họ và tên" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input placeholder="Số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="dob"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="register-button"
            >
              Đăng Ký
            </Button>
          </Form.Item>
        </Form>
        <p className="login-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
