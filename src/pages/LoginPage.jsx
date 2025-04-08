import React, { useState } from "react";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import userApi from "../api/userApi";
import { jwtDecode } from "jwt-decode";
import "../styles/loginPage.css";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Ưu tiên lấy tham số chuyển hướng từ location.state.from (khi chuyển từ component khác sang như SurveyResultPage)
  // Nếu không có, thử lấy từ query parameter "redirect"
  // Nếu không có cả hai, mặc định là "/"
  const redirectPath = location.state?.from || searchParams.get("redirect") || "/";
  console.log("Redirect path after login:", redirectPath);
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await userApi.login(formData.email, formData.password);

      const { token, userId } = response.data;
      if (!token) throw new Error("Token không hợp lệ!");

      const decoded = jwtDecode(token);
      const userData = {
        token,
        userId,
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

      login(userData);

      // Kiểm tra redirectUrl từ state hoặc localStorage
      const finalRedirectPath = location.state?.from || 
                               localStorage.getItem('authRedirectUrl') || 
                               redirectPath;
      
      // Xóa redirectUrl từ localStorage sau khi đã sử dụng
      localStorage.removeItem('authRedirectUrl');

      // Thông báo cho người dùng biết sắp được chuyển hướng
      if (finalRedirectPath !== "/") {
        console.log(`Đăng nhập thành công! Đang chuyển đến: ${finalRedirectPath}`);
      }

      setTimeout(() => {
        navigate(
          userData.role === "Manager"
            ? "/admin/user"
            : userData.role === "SkinTherapist"
            ? "/staff-calendar"
            : userData.role === "Staff"
            ? "/staff/approve-blogs"
            : redirectPath
        );
      }, 500);
    } catch (error) {
      alert("Sai email hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <h2>Đăng Nhập</h2>
        <p className="back-home-link">
          <Link to="/">← Quay về trang chủ</Link>
        </p>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
        </button>

        <p className="forgot-password-link">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </p>
        <p className="register-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
