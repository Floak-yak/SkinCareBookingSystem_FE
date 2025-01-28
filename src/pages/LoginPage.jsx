import { Link } from "react-router-dom";
import { Input, Button, Typography } from "antd";
import { GoogleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Login = () => {
  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#f4f4f4" }}>
      {/* Hình ảnh bên trái */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#e5e5e5", height: "100%" }}>
        <div style={{ width: "60%", height: "70%", background: "#d9d9d9", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px" }}>
          <Text style={{ color: "#aaa", fontSize: "18px" }}>Image Placeholder</Text>
        </div>
      </div>

      {/* Form đăng nhập bên phải */}
      <div style={{ flex: 1, padding: "50px 80px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "5px" }}>Welcome Back!</Title>
        <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: "25px" }}>
          Please log in to your account
        </Text>

        {/* Email */}
        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Email Address</label>
        <Input placeholder="Enter your email" size="large" style={{ marginBottom: "15px", borderRadius: "8px" }} />

        {/* Password */}
        <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Password</label>
        <Input.Password placeholder="Enter your password" size="large" style={{ marginBottom: "15px", borderRadius: "8px" }} />

        {/* Nút Login */}
        <Button type="primary" size="large" style={{ width: "100%", borderRadius: "8px", fontSize: "16px", fontWeight: "500", marginTop: "10px" }}>
          Log in
        </Button>

        {/* Quên mật khẩu */}
        <Text type="secondary" style={{ display: "block", textAlign: "right", marginTop: "10px" }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </Text>

        {/* Chuyển hướng Sign Up */}
        <Text style={{ display: "block", textAlign: "center", marginTop: "15px" }}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </Text>

        {/* Hoặc đăng nhập bằng Google */}
        <div style={{ textAlign: "center", margin: "20px 0", color: "#aaa", fontWeight: "500" }}>OR</div>
        <Button icon={<GoogleOutlined />} size="large" style={{ width: "100%", borderRadius: "8px", fontSize: "16px", border: "1px solid #ddd", fontWeight: "500" }}>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default Login;
