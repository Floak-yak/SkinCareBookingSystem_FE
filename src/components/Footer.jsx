import { Link } from "react-router-dom";
import { FacebookOutlined, InstagramOutlined, TwitterOutlined } from "@ant-design/icons";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <Link to="/" className="footer-logo">SkinCare Booking</Link>

        <div className="footer-links">
          <Link to="/">Trang chủ</Link>
          <Link to="/services">Dịch vụ</Link>
          <Link to="/blogs">Blog</Link>
          <Link to="/contact">Liên hệ</Link>
        </div>

        <div className="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FacebookOutlined />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <InstagramOutlined />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <TwitterOutlined />
          </a>
        </div>

        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} SkinCare Booking. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
