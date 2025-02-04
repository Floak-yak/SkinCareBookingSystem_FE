import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import AuthContext from "../context/AuthContext";
import "../styles/loginPage.css";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("/data/users.json");
      const usersFromJson = await response.json();

      const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
      const users = [...usersFromJson, ...storedUsers];

      const foundUser = users.find(
        (user) => user.Email === values.email && user.Password === values.password
      );

      if (foundUser) {
        localStorage.setItem("currentUser", JSON.stringify(foundUser));
        login(foundUser);

        message.success(`Chào mừng, ${foundUser.FullName}!`);
        
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 500);
      } else {
        message.error("Sai email hoặc mật khẩu!");
      }
    } catch (error) {
      message.error("Lỗi kết nối dữ liệu!");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng Nhập</h2>
        <Form className="login-form" onFinish={handleLogin}>
          <Form.Item name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="login-button">
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
        <p className="register-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
