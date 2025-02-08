import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import "../styles/loginPage.css";
import useAuth from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";

const LoginPage = () => {
  const { login } = useAuth();
  const { data: users } = useFetch("/data/users.json", "users");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (values) => {
    setLoading(true);

    const foundUser = users.find(
      (user) => user.Email === values.email && user.Password === values.password
    );

    if (foundUser) {
      login(foundUser);
      message.success(`Chào mừng, ${foundUser.FullName}!`);
      setTimeout(() => navigate("/"), 500);
    } else {
      message.error("Sai email hoặc mật khẩu!");
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
