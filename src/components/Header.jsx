import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';

const { Header } = Layout;

const AppHeader = () => {
  return (
    <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#001529' }}>
      {/* Logo */}
      <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
        Skincare Center
      </div>

      {/* Navigation Menu */}
      <Menu theme="dark" mode="horizontal" style={{ flex: 1, marginLeft: '20px' }}>
        <Menu.Item key="1">
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/booking">Booking</Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/login">Login</Link>
        </Menu.Item>
      </Menu>
    </Header>
  );
};

export default AppHeader;
