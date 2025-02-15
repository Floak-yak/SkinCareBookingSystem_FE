import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/forgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Giả lập tạo token reset (trong thực tế bạn gọi API backend để gửi email reset)
    const token = Math.random().toString(36).substr(2);
    localStorage.setItem('resetToken', token);
    localStorage.setItem('resetEmail', email);
    setMessage('Nếu email của bạn tồn tại, bạn sẽ nhận được email đặt lại mật khẩu.');
    // Nếu muốn chuyển hướng sau khi gửi email reset:
    // navigate('/check-email');
  };

  return (
    <div className="forgot-password">
      <h2>Quên mật khẩu</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Gửi yêu cầu đặt lại mật khẩu</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
