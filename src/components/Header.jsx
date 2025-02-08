import { useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown, Button, message } from "antd";
import {
  UserOutlined, LogoutOutlined, IdcardOutlined, MailOutlined,
  MenuOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
import "../styles/header.css";
import useAuth from "../hooks/useAuth";

const Header = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    message.success("Đã đăng xuất!");
  };

  const userMenuItems = [
<<<<<<< HEAD
    {
      key: "profile",
      label: (                    
        <span>
          <UserOutlined /> {user?.FullName || "Người dùng"}
        </span>
      ),
    },
    {
      key: "role",
      label: (
        <span>
          <IdcardOutlined /> Vai trò: {user?.Role || "Chưa xác định"}
        </span>
      ),
    },
    {
      key: "email",
      label: (
        <span>
          <MailOutlined /> {user?.Email || "Chưa có email"}
        </span>
      ),
    },
    {
      type: "divider",
    },
    user?.Role === "Staff"
      ? {
          key: "approve",
          label: (
            <Link to="/staff/approve-blogs" className="staff-approve-btn">
              <CheckCircleOutlined /> Duyệt bài viết
        </Link>
      ),
        }
      : null,
    {
      key: "logout",
      label: (
        <span onClick={handleLogout}>
          <LogoutOutlined /> Đăng xuất
        </span>
      ),
    },
  ].filter(Boolean); 
=======
    { key: "profile", label: <span><UserOutlined /> {user?.FullName || "Người dùng"}</span> },
    { key: "role", label: <span><IdcardOutlined /> Vai trò: {user?.Role || "Chưa xác định"}</span> },
    { key: "email", label: <span><MailOutlined /> {user?.Email || "Chưa có email"}</span> },
    { type: "divider" },
    user?.Role === "Staff" && {
      key: "approve",
      label: (
        <Link to="/staff/approve-blogs" className="staff-approve-btn">
          <CheckCircleOutlined /> Duyệt bài viết
        </Link>
      ),
    },
    { key: "logout", label: <span onClick={handleLogout}><LogoutOutlined /> Đăng xuất</span> },
  ].filter(Boolean);
>>>>>>> 5a88685 (Remove unused assets and hooks; update styles and configuration; enhance authentication context and registration logic)

  return (
    <header className="header">
      <Link to="/" className="logo">SkinCare Booking</Link>
      <nav className={`nav ${menuOpen ? "open" : ""}`}>
<<<<<<< HEAD
            <Link to="/">Trang chủ</Link>
            <Link to="/services">Dịch vụ</Link>
        <Link to="/blogs">Blog</Link>
            <Link to="/contact">Liên hệ</Link>
=======
        <Link to="/">Trang chủ</Link>
        <Link to="/services">Dịch vụ</Link>
        <Link to="/blogs">Blogs</Link>
        <Link to="/contact">Liên hệ</Link>
>>>>>>> 5a88685 (Remove unused assets and hooks; update styles and configuration; enhance authentication context and registration logic)
      </nav>

      <div className="auth">
        {user ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />}>{user?.FullName || "Người dùng"}</Button>
          </Dropdown>
        ) : (
          <>
            <Link to="/login"><Button type="text">Đăng nhập</Button></Link>
            <Link to="/register"><Button type="primary">Đăng ký</Button></Link>
          </>
        )}
      </div>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <MenuOutlined />
      </button>
    </header>
  );
};

export default Header;
