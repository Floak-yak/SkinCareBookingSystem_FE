import React from 'react';

const VerifyFail = () => {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ color: '#e74c3c' }}>Xác thực thất bại!</h1>
      <p>Token xác thực không hợp lệ hoặc đã hết hạn.</p>
      <a href="/" style={{
        background: '#e74c3c', color: '#fff', padding: '10px 20px',
        textDecoration: 'none', borderRadius: '4px'
      }}>
        Về trang chủ
      </a>
    </div>
  );
};

export default VerifyFail;
