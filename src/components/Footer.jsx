import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer style={{ textAlign: 'center', backgroundColor: '#f0f2f5', padding: '10px 50px' }}>
      <p>© 2025 Skincare Center. All rights reserved.</p>
      <p>Contact us: support@skincare.com | Hotline: +123 456 789</p>
    </Footer>
  );
};

export default AppFooter;
