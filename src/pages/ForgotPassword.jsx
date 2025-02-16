import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/forgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Đang xử lý...');

    try {
      // Gọi API BE, giả sử POST /api/forgot-password
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        // BE gửi email chứa mật khẩu mới, FE chỉ hiển thị thông báo
        setMessage('Chúng tôi đã gửi mật khẩu mới đến hộp thư của bạn.');
      } else {
        // Tuỳ theo BE, có thể trả 404, 400, ...
        setMessage('Email không tồn tại hoặc có lỗi xảy ra.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
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
