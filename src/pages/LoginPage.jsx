import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import "../styles/loginPage.css";
import useAuth from "../hooks/useAuth";
import apiClient from "../api/apiClient";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/User/Login", {
        email: values.email,
        password: values.password,
      });

      const token = response.data; // Nhận token từ API

      if (!token) {
        message.error("Phản hồi từ server không hợp lệ!");
        return;
      }

      // ✅ Decode token để lấy thông tin user
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken);

      const userData = {
        token,
        fullName:
          decodedToken[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
          ],
        email:
          decodedToken[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ],
        role: decodedToken[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ],
      };

      login(userData);
      message.success(`Chào mừng, ${userData.fullName}!`);
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Sai email hoặc mật khẩu! Vui lòng thử lại.";
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
