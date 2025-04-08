import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Button, message, Badge, Avatar } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  IdcardOutlined,
  MailOutlined,
  MenuOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import "../styles/header.css";
import useAuth from "../hooks/useAuth";
import CartContext from "../context/CartContext";

const Header = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useContext(CartContext);
  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    message.success("Đã đăng xuất!");
    navigate("/");
  };

  // Lấy role
  const role = user?.role;

  // =================== MENU USER DROPDOWN ====================
  const userMenuItems = [
    {
      key: "profile",
      label: (
        <span>
          <UserOutlined /> {user?.fullName || "Người dùng"}
        </span>
      ),
    },
    {
      key: "email",
      label: (
        <span>
          <MailOutlined /> {user?.email || "Chưa có email"}
        </span>
      ),
    },
    { type: "divider" },

    // Duyệt bài nếu role = Staff
    role === "Staff" && {
      key: "approve",
      label: (
        <Link to="/staff/approve-blogs" className="staff-approve-btn">
          <CheckCircleOutlined /> Duyệt bài viết
        </Link>
      ),
    },

    // Role = Manager
    role === "Manager" && {
      key: "adminPage",
      label: (
        <Link to="/admin" className="admin-btn">
          <CheckCircleOutlined /> Trang Admin
        </Link>
      ),
    },
    role === "Customer" && {
      key: "orderHistory",
      label: (
        <Link to="/order-history" className="order-history-btn">
          <CheckCircleOutlined /> Lịch sử đặt hàng
        </Link>
      ),
    },
    role === "Customer" && {
      key: "bookingHistory",
      label: (
        <Link to="/booking-history" className="booking-history-btn">
          <CheckCircleOutlined /> Lịch sử đặt dịch vụ
        </Link>
      ),
    },
    role === "Customer" && {
      key: "refundHistory",
      label: (
        <Link to="/refund-history" className="booking-history-btn">
          <CheckCircleOutlined /> Trạng thái hoàn tiền
        </Link>
      ),
    },
    role === "Customer" && {
      key: "skinSurvey",
      label: (
        <Link to="/survey" className="skin-survey-btn">
          <ProfileOutlined /> Kiểm tra loại da
        </Link>
      ),
    },

    { type: "divider" },
    {
      key: "logout",
      label: (
        <Link to="/" onClick={handleLogout}>
          <LogoutOutlined /> Đăng xuất</Link>
      ),
    },
  ].filter(Boolean);

  // =================== MENU CHÍNH (TUỲ ROLE) ====================
  const renderNavLinks = () => {
    if (role === "Manager") {
      return (
        <>
          {/* Quản trị */}
          <Link to="/admin/user">Quản lý tài khoản</Link>
          <Link to="/admin/product">Quản lý sản phẩm</Link>
          <Link to="/admin/manage-services">Quản lý dịch vụ</Link>
          <Link to="/admin/categories">Quản lý danh mục</Link>
          <Link to="/admin/manager-orders">Quản lý đơn hàng</Link>
          <Link to="/admin/survey-manager">Quản lý câu hỏi</Link>
          <Link to="/admin/cancel-booking">Quản lí lịch hủy</Link>
        </>
      );
    } else if (role === "Staff") {
      return (
        <>
          {/* Approve Blogs */}
          <Link to="/staff/approve-blogs">Duyệt bài</Link>
        </>
      );
    } else if (role === "SkinTherapist") {
      return (
        <>
          <Link to="/staff-calendar">Calendar</Link>
        </>
      );
    } else {
      // Role = "Customer" hoặc chưa login
      return (
        <>
          <Link to="/">Trang chủ</Link>
          <Link to="/services">Dịch vụ</Link>
          <Link to="/products">Sản phẩm</Link>
          <Link to="/blogs">Blogs</Link>
          <Link to="/survey">Kiểm tra loại da</Link>
          <Link to="/contact">Liên hệ</Link>
          <Link to="/about">Về chúng tôi</Link>
        </>
      );
    }
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        SkinCare Booking
      </Link>

      {/* MENU CHÍNH */}
      <nav className={`nav ${menuOpen ? "open" : ""}`}>{renderNavLinks()}</nav>

      {/* CART & USER */}

      <div className="cart-auth">
        {(role === "Customer" || !role) && (
          <Link to="/cart" className="cart-link">
            <Badge count={totalItems} showZero={false} offset={[0, 0]}>
              <ShoppingCartOutlined
                style={{ fontSize: "25px", color: "white" }}
              />
            </Badge>
          </Link>
        )}

        {/* AVATAR USER */}
        <div className="auth">
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" className="user-info">
                <Avatar src={user.avatar} icon={<UserOutlined />} />
                <span className="user-name">
                  {user?.fullName || "Người dùng"}
                </span>
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

      {/* TOGGLE MENU */}
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <MenuOutlined />
      </button>
    </header>
  );
};

export default Header;
