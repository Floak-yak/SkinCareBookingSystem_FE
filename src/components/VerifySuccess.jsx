import React from 'react';

const VerifySuccess = () => {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ color: '#2ecc71' }}>Xác thực thành công!</h1>
      <p>Tài khoản của bạn đã được xác thực. Hãy đăng nhập và trải nghiệm các dịch vụ của chúng tôi.</p>
      <a href="/" style={{
        background: '#2ecc71', color: '#fff', padding: '10px 20px',
        textDecoration: 'none', borderRadius: '4px'
      }}>
        Về trang chủ
      </a>
    </div>
  );
};

export default VerifySuccess;
