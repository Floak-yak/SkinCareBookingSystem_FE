import { Link } from "react-router-dom";
import { Input, Button, Dropdown, Menu } from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import Logo from "../assets/logo.png";

const menu = (
  <Menu>
    <Menu.Item key="profile">
      <Link to="/profile">Profile</Link>
    </Menu.Item>
    <Menu.Item key="logout">
      <Link to="/logout">Logout</Link>
    </Menu.Item>
  </Menu>
);

const Header = ({ isLoggedIn }) => {
  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 50px", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      {/* Logo */}
      <Link to="/">
        <img src={Logo} alt="SkinCare" style={{ height: 40 }} />
      </Link>

      {/* Navigation */}
      <nav style={{ flex: 1, marginLeft: "50px" }}>
        <Link to="/" style={{ marginRight: "20px", fontWeight: "500" }}>Home</Link>
        <Link to="/services" style={{ marginRight: "20px" }}>Services</Link>
        <Link to="/skin-test" style={{ marginRight: "20px" }}>Skin Testing</Link>
        <Link to="/blog">Blog</Link>
      </nav>

      {/* Search */}
      <Input placeholder="Search" prefix={<SearchOutlined />} style={{ width: "200px", borderRadius: "20px" }} />

      {/* Auth Buttons */}
      {isLoggedIn ? (
        <Dropdown overlay={menu} placement="bottomRight">
          <Button shape="circle" icon={<UserOutlined />} />
        </Dropdown>
      ) : (
        <div style={{ marginLeft: "20px" }}>
          <Link to="/login">
            <Button style={{ marginRight: "10px", borderRadius: "8px" }}>Log in</Button>
          </Link>
          <Link to="/register">
            <Button type="primary" style={{ borderRadius: "8px" }}>Sign up</Button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
