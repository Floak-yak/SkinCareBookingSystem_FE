import { useState } from "react";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import useAuth from "../hooks/useAuth";
import apiClient from "../api/apiClient";
import { jwtDecode } from "jwt-decode";
import "../styles/loginPage.css";

const LoginPage = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Check both the query param and the state for redirect path
  const redirectPath = searchParams.get("redirect") || location.state?.from || "/";

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/api/User/Login", {
        email: values.email,
        password: values.password,
      });

      // => FE lấy token, userId
      const { token, userId } = response.data;
      if (!token) {
        message.error("Phản hồi từ server không hợp lệ!");
        return;
      }

      // Decode token để lấy thông tin user
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken);

      // Tuỳ các claim mà bạn đã set
      const fullName =
        decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ];
      const email =
        decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ];
      const role =
        decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      const userData = {
        token, // JWT
        userId, 
        fullName,
        email,
        role,
      };

      // Gọi hàm login trong AuthContext => lưu localStorage, setUser
      login(userData);

      message.success(`Chào mừng, ${userData.fullName}!`);

      setTimeout(() => {
        if (role === "Manager") {
          navigate("/admin/user");
        } else if (redirectPath && redirectPath !== '/') {
          // Redirect to the page that user was trying to access
          navigate(redirectPath);
        } else {
          navigate("/");
        }
      }, 500);

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
