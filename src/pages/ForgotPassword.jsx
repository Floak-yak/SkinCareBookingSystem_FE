import React, { useState } from "react";
import userApi from "../api/userApi"; // Thay vì fetch
import "../styles/forgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Đang xử lý...");
    try {
      const res = await userApi.resetPassword(email); 
      setMessage(res.data); // BE trả "Reset success"...
    } catch (error) {
      const errText = error.response?.data || "Email không tồn tại!";
      setMessage(errText);
    }
  };

  return (
    <div className="forgot-password">
      <h2>Quên mật khẩu</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Gửi yêu cầu</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
