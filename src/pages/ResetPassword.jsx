import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/resetPassword.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp.");
      return;
    }
    const savedToken = localStorage.getItem("resetToken");
    if (token !== savedToken) {
      setError("Token không hợp lệ hoặc đã hết hạn.");
      return;
    }
    const email = localStorage.getItem("resetEmail");
    console.log("Reset email:", email);
    let users = JSON.parse(localStorage.getItem("users")) || [];
    console.log("Users trước khi cập nhật:", users);
    users = users.map((user) => {
      if (user.email === email) {
        return { ...user, password: newPassword };
      }
      return user;
    });
    console.log("Users sau khi cập nhật:", users);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.removeItem("resetToken");
    localStorage.removeItem("resetEmail");
    alert("Mật khẩu đã được cập nhật.");
    navigate("/login");
  };

  return (
    <div className="reset-password">
      <h2>Cập nhật mật khẩu</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Mật khẩu mới:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <label>Xác nhận mật khẩu:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Cập nhật mật khẩu</button>
      </form>
    </div>
  );
};

export default ResetPassword;
