import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown, Button, message, Badge } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  IdcardOutlined,
  MailOutlined,
  MenuOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import "../styles/header.css";
import useAuth from "../hooks/useAuth";
import CartContext from "../context/CartContext";

const Header = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useContext(CartContext);
  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    message.success("Đã đăng xuất!");
  };

  const userMenuItems = [
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
    { type: "divider" },
    user?.Role === "Staff" && {
      key: "approve",
      label: (
        <Link to="/staff/approve-blogs" className="staff-approve-btn">
          <CheckCircleOutlined /> Duyệt bài viết
        </Link>
      ),
    },
    {
      key: "logout",
      label: (
        <Link to="/" onClick={handleLogout}>
          <LogoutOutlined /> Đăng xuất</Link>
      ),
    },
  ].filter(Boolean);

  return (
    <header className="header">
      <Link to="/" className="logo">
        SkinCare Booking
      </Link>
      <nav className={`nav ${menuOpen ? "open" : ""}`}>
        <Link to="/">Trang chủ</Link>
        <Link to="/services">Dịch vụ</Link>
        <Link to="/products">Sản phẩm</Link>
        <Link to="/blogs">Blogs</Link>
        <Link to="/contact">Liên hệ</Link>
      </nav>

      <div className="cart-auth">
        <Link to="/cart" className="cart-link">
          <Badge count={totalItems} showZero={false} offset={[0, 0]}>
            <ShoppingCartOutlined style={{ fontSize: "25px", color: "white" }} />
          </Badge>
        </Link>
        <div className="auth">
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>
                {user?.FullName || "Người dùng"}
              </Button>
            </Dropdown>
          ) : (
            <>
              <Link to="/login">
                <Button type="text">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button type="text">Đăng ký</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <MenuOutlined />
      </button>
    </header>
  );
};

export default Header;
