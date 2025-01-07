import React from 'react';
import { Layout } from 'antd';
import AppHeader from '../components/Header';
import AppFooter from '../components/Footer';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <AppHeader />

      {/* Content */}
      <Content style={{ padding: '20px', margin: '20px auto', maxWidth: '1200px', background: '#fff' }}>
        {children}
      </Content>

      {/* Footer */}
      <AppFooter />
    </Layout>
  );
};

export default MainLayout;
