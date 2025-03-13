import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import useAuth from "../hooks/useAuth";
import userApi from "../api/userApi"; // Thay vì gọi thẳng apiClient
import { jwtDecode } from "jwt-decode";
import "../styles/loginPage.css";

const LoginPage = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      // GỌI userApi.login thay vì apiClient.post
      const response = await userApi.login(values.email, values.password);

      const token = response.data; // BE trả về token

      if (!token) {
        message.error("Phản hồi từ server không hợp lệ!");
        return;
      }

      // Decode token => user info
      const decoded = jwtDecode(token);
      console.log("Decoded Token:", decoded);

      // Tùy claim name, email, role,...
      const userData = {
        token,
        fullName:
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        email:
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ],
        role: decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ],
      };

      // Gọi login từ useAuth => lưu localStorage, setUser
      login(userData);

      message.success(`Chào mừng, ${userData.fullName}!`);
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data || "Sai email hoặc mật khẩu!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng Nhập</h2>
        <Form className="login-form" onFinish={handleLogin}>
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
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
              className="login-button"
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
        <p className="forgot-password-link">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </p>
        <p className="register-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
